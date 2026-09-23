"use client";

import { SelectInput, Calendar, ProgressSpinner } from "@/compat/primereact";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import dynamic from "next/dynamic";
import { Link, useSearchParams } from "@/util/navigation";
import HeaderTwo from "@/component/header/HeaderTwo";
import { FiArrowLeft, FiChevronDown, FiDownload, FiEdit2, FiSearch, FiUsers, IconlyClose } from "@/elements/ui/icons/IconlyIcons";
import FilterPanel from "@/elements/ui/filters/FilterPanel";
import AnalyticsAvailability from "@/elements/actions/dashboard/AnalyticsAvailability";
import { useHttpClient } from "@/hooks/common/http-hook";
import { showNotification } from "@/redux/notification";
import { selectUser } from "@/redux/user";
import { sessionClaims } from "@/util/functions/authorization";
import { capitalizeFirstLetter } from "@/util/functions/capitalize";
import { formatRegionBadgeLabel, getRegionBadgeStyle } from "@/util/defines/REGION_BADGES";
import adminStyles from "@/screens/userActions/administration.module.scss";
import styles from "./backoffice.module.scss";
import AccountMembershipActions from "./AccountMembershipActions";
import { CopyableId, PhoneActions } from "@/elements/ui/dashboard/DashboardActions";
import { ACCESS_3 } from "@/util/defines/common";
import { canManageAccountType, canEditAccount, isEditableAccountRole, editableAccountRoles, protectedAccountRoles } from "./role-policy.mjs";
import { exportAccountsCsv } from "./export-accounts.mjs";

const MembersList = dynamic(() => import("@/elements/actions/dashboard/members/MembersList"), {
  loading: () => <p role="status">Loading member statistics…</p>,
});

const EMPTY_OPTIONS = { cities: [], roles: [], statuses: [] };
const ROLE_LABELS = {
  member: "Member",
  alumni: "Alumni",
  active_member: "Active member",
  regional_committee_member: "Regional committee member",
  regional_board_member: "Regional board member",
  national_board_member: "National board member",
  national_committee_member: "National committee member",
  admin: "Admin",
  support: "Support",
  vip: "VIP",
  super_admin: "Super admin",
};

const formatDateInput = (value) => value ? String(value).slice(0, 10) : "";
const formatCity = (value) => value ? capitalizeFirstLetter(value, true) : "Not assigned";
const accountName = (account) => `${account.name || ""} ${account.surname || ""}`.trim() || account.email;
const accountInitials = (account) => `${account.name?.[0] || ""}${account.surname?.[0] || ""}`.toUpperCase();
const accountQuery = ({ type, page, pageSize, search, city, status }) => {
  const params = new URLSearchParams({ type, page: String(page), pageSize: String(pageSize) });
  if (search) params.set("search", search);
  if (city) params.set("city", city);
  if (status) params.set("status", status);
  return params;
};


const previewDate = value => {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.getTime())
    ? new globalThis.Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Europe/Amsterdam" }).format(date)
    : "Not provided";
};

function AccountDetails({ account }) {
  const university = String(account.university || "").trim();
  const otherUniversity = String(account.otherUniversityName || "").trim();
  const hasProfession = Boolean(String(account.profession || "").trim());
  const universityFields = hasProfession ? [] : university && university.toLowerCase() !== "other"
    ? [["University", university]]
    : otherUniversity || university.toLowerCase() === "other"
      ? [["Other university", otherUniversity]]
      : [["University", ""]];
  const groups = [
    ["Account details", [
      ["Account ID", account.id, "id"], ["Account type", account.type === "alumni" ? "Alumni" : "Member"],
      ["Email", account.email], ["Mobile number", account.phone, "phone"], ["Date of birth", previewDate(account.birth)],
      ["Region", formatCity(account.region)], ["Status", account.status.replaceAll("_", " ")],
      ["Roles", account.roles.map(role => ROLE_LABELS[role] || role.replaceAll("_", " ")).join(", ")],
    ]],
    ["Education / Profession", hasProfession ? [["Profession", account.profession]] : [
      ...universityFields,
      ["Study programme", account.course], ["Graduation year", account.graduationDate],
      ["Student number", account.studentNumber],
    ]],
    ["Membership", [
      ["Joined", previewDate(account.joinDate)], ["Purchase date", previewDate(account.purchaseDate)],
      ["Expiry", account.nonExpiring || account.roles.includes("vip") ? "Non-expiring" : previewDate(account.expireDate)],
      ["Subscription period", account.subscription?.period ? `${account.subscription.period} ${account.subscription.period === 1 ? "month" : "months"}` : "Not provided"],
      ["Subscription ID", account.subscription?.id, "id"],
      ["Customer ID", account.subscription?.customerId, "id"],
      ...(account.type === "alumni" ? [["Alumni tier", account.tier ?? "Not provided"]] : []),
    ]],
  ];
  return <div className={styles.accountPreview}>
    <div className={styles.previewGroups}>{groups.map(([title, fields]) => <section key={title}>
      <h4>{title}</h4>
      <dl>{fields.map(([label, value, kind]) => <div key={label}><dt>{label}</dt><dd>{kind === "id" ? <CopyableId value={value} label={label} /> : kind === "phone" ? <PhoneActions phone={value} /> : value === "" || value == null ? "Not provided" : value}</dd></div>)}</dl>
    </section>)}</div>
  </div>;
}
AccountDetails.propTypes = { account: PropTypes.object.isRequired };

function AccountAvatar({ account }) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = String(account.image || "").trim();

  return (
    <span className={styles.avatar} aria-hidden="true">
      {image && !imageFailed ? (
        <img
          alt=""
          className={styles.avatarImage}
          loading="lazy"
          onError={() => setImageFailed(true)}
          src={image}
        />
      ) : accountInitials(account)}
    </span>
  );
}

AccountAvatar.propTypes = {
  account: PropTypes.object.isRequired,
};

function EditorField({ children, className = "", id, label }) {
  return (
    <div className={`rn-form-group ${styles.editorField} ${className}`.trim()}>
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

EditorField.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  id: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired,
};

const editorState = (account) => ({
  revision: account.revision,
  name: account.name || "",
  surname: account.surname || "",
  email: account.email || "",
  phone: account.phone || "",
  region: account.region || "",
  birth: formatDateInput(account.birth),
  university: account.university || "",
  otherUniversityName: account.otherUniversityName || "",
  graduationDate: account.graduationDate || "",
  course: account.course || "",
  studentNumber: account.studentNumber || "",
  profession: account.profession || "",
  status: account.status || "",
  expireDate: formatDateInput(account.expireDate),
  roles: editableAccountRoles(account.roles, account.type),
});

function AccountEditor({ account, currentAccountId, actorRoles, options, onClose, onSaved, onMembershipChanged }) {
  const [form, setForm] = useState(() => editorState(account));
  const [saving, setSaving] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const busy = saving || actionBusy;
  const closeEditor = useCallback(() => { if (!busy) onClose(); }, [busy, onClose]);
  const dirty = JSON.stringify(form) !== JSON.stringify(editorState(account));
  const canManageMembership = actorRoles.some(role => ACCESS_3.includes(role));
  const { sendRequest } = useHttpClient();
  const dispatch = useDispatch();
  const titleRef = useRef(null);
  const isSelf = currentAccountId === account.id;
  const statuses = options.statuses.includes(form.status)
    ? options.statuses
    : [form.status, ...options.statuses].filter(Boolean);

  useEffect(() => {
    titleRef.current?.focus();
    const onKeyDown = (event) => event.key === "Escape" && closeEditor();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeEditor]);

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const toggleRole = (role) => {
    if (!isEditableAccountRole(role, account.type) || isSelf) return;
    setForm((current) => ({
      ...current,
      roles: current.roles.includes(role)
        ? current.roles.filter((item) => item !== role)
        : [...current.roles, role],
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setSaving(true);
    try {
      const response = await sendRequest(
        `backoffice/accounts/${account.type}/${encodeURIComponent(account.id)}`,
        "PATCH",
        form,
        {},
        true,
        false,
      );
      if (!response?.account) return;
      dispatch(showNotification({ severity: "success", detail: `${accountName(response.account)} was updated` }));
      onSaved(response.account);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeEditor()}>
      <section className={styles.editor} role="dialog" aria-modal="true" aria-labelledby="account-editor-title">
        <header className={styles.editorHeader}>
          <div>
            <AccountAvatar key={account.image || "initials"} account={account} />
            <div>
              <h2 id="account-editor-title" ref={titleRef} tabIndex={-1}>{accountName(account)}</h2>
              <p>{account.type === "alumni" ? "Alumni account" : "Member account"}</p>
            </div>
          </div>
          <button className={styles.iconButton} type="button" onClick={closeEditor} disabled={busy} aria-label="Close account editor"><IconlyClose /></button>
        </header>

        <form className={styles.editorForm} data-modal-body onSubmit={submit}>
          <fieldset disabled={busy}>
            <legend>Contact details</legend>
            <div className={styles.fieldGrid}>
              <EditorField id="account-editor-name" label="First name"><input id="account-editor-name" className="bgsnl-form-control" name="name" value={form.name} onChange={change} required /></EditorField>
              <EditorField id="account-editor-surname" label="Last name"><input id="account-editor-surname" className="bgsnl-form-control" name="surname" value={form.surname} onChange={change} required /></EditorField>
              <EditorField className={styles.fullField} id="account-editor-email" label="Email"><input id="account-editor-email" className="bgsnl-form-control" name="email" type="email" value={form.email} onChange={change} required /></EditorField>
              <EditorField id="account-editor-phone" label="Mobile number"><input id="account-editor-phone" className="bgsnl-form-control" name="phone" type="tel" value={form.phone} onChange={change} required={account.type === "member"} /></EditorField>
              <EditorField id="account-editor-birth" label="Date of birth"><Calendar inputId="account-editor-birth" name="birth" dateFormat="dd/mm/yy" value={form.birth ? new Date(`${form.birth}T00:00:00`) : null} onChange={({ value }) => setForm(current => ({ ...current, birth: value ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}` : "" }))} required={account.type === "member"} /></EditorField>
              <EditorField className={styles.fullField} id="account-editor-region" label="City"><SelectInput id="account-editor-region" className="bgsnl-form-control" name="region" value={form.region} onChange={change}><option value="">Not assigned</option>{options.cities.map((city) => <option value={city} key={city}>{formatCity(city)}</option>)}</SelectInput></EditorField>
            </div>
          </fieldset>

          <fieldset disabled={busy}>
            <legend>Education / Profession</legend>
            <div className={styles.fieldGrid}>
              <EditorField className={styles.fullField} id="account-editor-university" label="University"><input id="account-editor-university" className="bgsnl-form-control" name="university" value={form.university} onChange={change} /></EditorField>
              <EditorField className={styles.fullField} id="account-editor-other-university" label="Other university name"><input id="account-editor-other-university" className="bgsnl-form-control" name="otherUniversityName" value={form.otherUniversityName} onChange={change} /></EditorField>
              <EditorField id="account-editor-graduation" label="Graduation year"><input id="account-editor-graduation" className="bgsnl-form-control" name="graduationDate" value={form.graduationDate} onChange={change} /></EditorField>
              <EditorField id="account-editor-student-number" label="Student number"><input id="account-editor-student-number" className="bgsnl-form-control" name="studentNumber" value={form.studentNumber} onChange={change} /></EditorField>
              <EditorField className={styles.fullField} id="account-editor-course" label="Study programme"><input id="account-editor-course" className="bgsnl-form-control" name="course" value={form.course} onChange={change} /></EditorField>
              <EditorField className={styles.fullField} id="account-editor-profession" label="Profession"><input id="account-editor-profession" className="bgsnl-form-control" name="profession" value={form.profession} onChange={change} /></EditorField>
            </div>
          </fieldset>

          <fieldset disabled={busy}>
            <legend>Access and status</legend>
            {isSelf && <p className={styles.selfNotice}>Your own roles and status are protected to prevent accidental loss of access.</p>}
            <div className={styles.statusFields}>
              <EditorField id="account-editor-status" label="Account status"><SelectInput id="account-editor-status" className="bgsnl-form-control" name="status" value={form.status} onChange={change} disabled={isSelf}>{statuses.map((status) => <option value={status} key={status}>{status.replaceAll("_", " ")}</option>)}</SelectInput></EditorField>
              {!account.roles?.includes("vip") && <EditorField id="account-editor-expiry" label="Membership expiry"><input id="account-editor-expiry" className="bgsnl-form-control" name="expireDate" type="date" min="1900-01-01" max="2200-12-31" value={form.expireDate} onChange={change} disabled={isSelf} required /></EditorField>}
            </div>
            {protectedAccountRoles(account.roles).length > 0 && (
              <p className={styles.selfNotice}>
                Read-only roles: {protectedAccountRoles(account.roles).map((role) => ROLE_LABELS[role]).join(", ")}.
              </p>
            )}
            {account.roles?.includes("vip") && <p className={styles.selfNotice}>VIP membership has no expiry date. Subscription payment requirements and account restrictions still apply.</p>}
            {account.type === "alumni" && <p className={styles.selfNotice}>Alumni can be assigned national board or national committee roles.</p>}
            <div className={styles.roles} aria-label="Account roles">
              {options.roles.filter(role => isEditableAccountRole(role, account.type)).map((role) => {
                return <label key={role} className={styles.roleOption}><input type="checkbox" checked={form.roles.includes(role)} disabled={isSelf} onChange={() => toggleRole(role)} /><span>{ROLE_LABELS[role] || role.replaceAll("_", " ")}</span></label>;
              })}
            </div>
          </fieldset>

          {canManageMembership && <AccountMembershipActions account={account} disabled={saving || dirty} onBusyChange={setActionBusy} onChanged={onMembershipChanged} />}

          <footer className={styles.editorFooter}>
            <button type="button" className={styles.secondaryButton} onClick={closeEditor} disabled={busy}>Cancel</button>
            <button type="submit" className={styles.primaryButton} disabled={busy}>{saving ? "Saving…" : "Save changes"}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}

AccountEditor.propTypes = {
  account: PropTypes.object.isRequired,
  currentAccountId: PropTypes.string,
  actorRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  onMembershipChanged: PropTypes.func.isRequired,
  options: PropTypes.shape({
    cities: PropTypes.arrayOf(PropTypes.string),
    roles: PropTypes.arrayOf(PropTypes.string),
    statuses: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};

export default function BackofficeAccounts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statistics = searchParams.get("view") === "statistics";
  const [type, setType] = useState("member");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [accounts, setAccounts] = useState([]);
  const [options, setOptions] = useState(EMPTY_OPTIONS);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [selected, setSelected] = useState(null);
  const [expandedAccountId, setExpandedAccountId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadingList, setLoadingList] = useState(true);
  const [exporting, setExporting] = useState(false);
  const requestSequence = useRef(0);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const accountRoleScope = [...(user.roles || [])].sort().join("|");
  const { sendRequest } = useHttpClient();
  const sendRequestRef = useRef(sendRequest);
  sendRequestRef.current = sendRequest;
  const currentAccountId = useMemo(() => {
    try { return user.session ? sessionClaims(user.session).userId : ""; } catch { return ""; }
  }, [user.session]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!canManageAccountType(accountRoleScope.split("|"), type)) {
      setAccounts([]);
      setSelected(null);
      setType("member");
      return undefined;
    }
    if (statistics) return undefined;
    let active = true;
    const controller = new AbortController();
    const sequence = ++requestSequence.current;
    const params = accountQuery({ type, page, pageSize: 25, search, city, status: statusFilter });
    setLoadingList(true);
    setExpandedAccountId(null);
    sendRequestRef.current(`backoffice/accounts?${params}`, "GET", null, {}, true, false, { signal: controller.signal })
      .then((response) => {
        if (!active || sequence !== requestSequence.current || !response) return;
        setAccounts(response.accounts || []);
        setOptions(response.options || EMPTY_OPTIONS);
        setPagination({ total: response.total || 0, totalPages: response.totalPages || 1 });
      })
      .finally(() => active && sequence === requestSequence.current && setLoadingList(false));
    return () => { active = false; controller.abort(); };
  }, [type, page, search, city, statusFilter, statistics, refreshKey, accountRoleScope, user.region]);

  const chooseType = (nextType) => {
    if (!canManageAccountType(user.roles, nextType)) return;
    setType(nextType);
    setPage(1);
    setSelected(null);
  };

  const switchView = (view) => {
    setSelected(null);
    setSearchParams((current) => {
      if (view === "statistics") current.set("view", "statistics");
      else current.delete("view");
      return current;
    });
  };

  const saved = (account) => {
    setAccounts((current) => current.map((item) => item.id === account.id ? account : item));
    setSelected(null);
    setRefreshKey(key => key + 1);
  };

  const openAccountEditor = (account) => {
    if (!canEditAccount(user.roles, account.roles)) return;
    setSelected(account);
  };

  const exportDirectory = async () => {
    if (exporting || loadingList || pagination.total === 0) return;
    setExporting(true);
    try {
      const requestPage = async (requestedPage) => {
        const params = accountQuery({ type, page: requestedPage, pageSize: 100, search, city, status: statusFilter });
        return sendRequestRef.current(`backoffice/accounts?${params}`, "GET", null, {}, false, false);
      };
      const first = await requestPage(1);
      if (!first?.accounts?.length) {
        dispatch(showNotification({ severity: "info", detail: "There are no accounts to export." }));
        return;
      }
      const pages = Math.max(1, Number(first.totalPages) || 1);
      const remainingPages = Array.from({ length: pages - 1 }, (_, index) => index + 2);
      const remaining = await Promise.all(remainingPages.map(requestPage));
      const exportAccounts = [
        ...first.accounts,
        ...remaining.flatMap((response) => response?.accounts || []),
      ];
      exportAccountsCsv(exportAccounts, type);
      dispatch(showNotification({ severity: "success", detail: `${exportAccounts.length} ${type === "alumni" ? "alumni" : "member"} profiles exported.` }));
    } catch {
      dispatch(showNotification({ severity: "error", detail: "The account export could not be prepared. Please try again." }));
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <HeaderTwo headertransparent="header--transparent" colorblack="color--black" logoname="logo.png" />
      <main className={`container user-workspace-page event-admin-page ${styles.page}`}>
        <nav className={adminStyles.views} aria-label="Account administration">
          <Link className={adminStyles.backLink} to="/user/dashboard" aria-label="Back to administration">
            <FiArrowLeft size={24} aria-hidden />
            <span>Administration</span>
          </Link>
          <div className={adminStyles.viewTabs}>
            <button type="button" aria-current={!statistics ? "page" : undefined} onClick={() => switchView("accounts")}>Manage accounts</button>
            <button type="button" aria-current={statistics ? "page" : undefined} onClick={() => switchView("statistics")}>Member statistics</button>
          </div>
        </nav>

        <header className="event-workspace-heading event-dashboard-heading">
          <div>
            <h1>Accounts dashboard</h1>
            <p>Find and manage member and alumni profiles, account status and administrative roles.</p>
          </div>
          {!statistics && <div className="workspace-heading-actions">
            <button
              className={styles.exportButton}
              disabled={loadingList || exporting || pagination.total === 0}
              onClick={exportDirectory}
              type="button"
            >
              <FiDownload aria-hidden />
              <span>{exporting ? "Preparing sheet…" : "Export sheet"}</span>
            </button>
          </div>}
        </header>

        {statistics ? <section className={styles.directory} aria-label="Member statistics"><AnalyticsAvailability title="Member analytics"><MembersList /></AnalyticsAvailability></section> : <section className={styles.directory} aria-label={`${type} directory`}>
          <FilterPanel
            onClear={() => { setType("member"); setSearchInput(""); setSearch(""); setCity(""); setStatusFilter(""); setPage(1); }}
            summary={(
              <span aria-live="polite">
                {loadingList ? null : `${pagination.total} ${type === "alumni" ? "alumni" : pagination.total === 1 ? "member" : "members"}`}
              </span>
            )}
            title="Filter accounts"
          >
            <label><span>Show</span><SelectInput className="bgsnl-form-control" value={type} onChange={(event) => chooseType(event.target.value)}><option value="member">Members</option>{canManageAccountType(user.roles, "alumni") && <option value="alumni">Alumni</option>}</SelectInput></label>
            <label className={styles.searchField}><span>Search</span><div><FiSearch aria-hidden /><input className="bgsnl-form-control" type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} /></div></label>
            <label><span>City</span><SelectInput className="bgsnl-form-control" value={city} onChange={(event) => { setCity(event.target.value); setPage(1); }}><option value="">All cities</option>{options.cities.map((item) => <option key={item} value={item}>{formatCity(item)}</option>)}<option value="unassigned">Not assigned</option></SelectInput></label>
            <label><span>Status</span><SelectInput className="bgsnl-form-control" aria-label="Account status filter" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}><option value="">All statuses</option>{options.statuses.map(status => <option value={status} key={status}>{capitalizeFirstLetter(status.replaceAll("_", " ").replaceAll("-", " "))}</option>)}</SelectInput></label>
          </FilterPanel>

          {loadingList ? (
            <div className={styles.accountsLoading} role="status">
              <ProgressSpinner style={{ width: "40px", height: "40px" }} aria-hidden="true" />
              <span className={styles.visuallyHidden}>Loading accounts…</span>
            </div>
          ) : accounts.length === 0 ? (
            <div className={styles.empty}><FiUsers aria-hidden /><h2>No accounts found</h2><p>Try a different search or city filter.</p></div>
          ) : (
            <div className={styles.tableWrap} aria-busy={loadingList}>
              <table>
                <thead><tr><th>Account</th><th className={styles.contactCell}>Contact</th><th>City</th><th className={styles.statusCell}>Status</th><th>Roles</th><th><span className={styles.visuallyHidden}>Actions</span></th></tr></thead>
                <tbody>{accounts.map((account) => {
                  const editable = canEditAccount(user.roles, account.roles);
                  const expanded = expandedAccountId === account.id;
                  const panelId = `account-details-${account.type}-${account.id}`;
                  const toggleDetails = () => setExpandedAccountId(current => current === account.id ? null : account.id);

                  return (
                    <Fragment key={account.id}>
                    <tr className={styles.summaryRow} tabIndex={0} aria-expanded={expanded} aria-controls={panelId}
                      onClick={(event) => { if (!event.target.closest("button, a")) toggleDetails(); }}
                      onKeyDown={(event) => {
                        if (event.target === event.currentTarget && ["Enter", " "].includes(event.key)) {
                          event.preventDefault();
                          toggleDetails();
                        }
                      }}>
                      <td data-label="Account">
                        <span className={styles.mobileStatusDot} data-status={account.status} role="img" aria-label={`Status: ${account.status.replaceAll("_", " ")}`} />
                        <div className={styles.person}>
                          <AccountAvatar key={account.image || "initials"} account={account} />
                          <div className={styles.personText}>
                            <strong>{accountName(account)}</strong>
                            <a className={styles.mobileEmail} href={`mailto:${account.email}`}>{account.email}</a>
                          </div>
                        </div>
                      </td>
                      <td data-label="Contact" className={`${styles.detailCell} ${styles.contactCell}`}><a href={`mailto:${account.email}`}>{account.email}</a><small>{account.phone ? <PhoneActions phone={account.phone} /> : "No mobile number"}</small></td>
                      <td data-label="Region" className={styles.regionCell} style={getRegionBadgeStyle(account.region)}>{formatRegionBadgeLabel(account.region)}</td>
                      <td data-label="Status" className={`${styles.detailCell} ${styles.statusCell}`}><span className={styles.status} data-status={account.status}>{account.status.replaceAll("_", " ")}</span></td>
                      <td data-label="Roles" className={styles.rolesCell}><div className={styles.roleTags}>{account.roles.length ? account.roles.map((role) => <span key={role} data-role={role}>{ROLE_LABELS[role] || role.replaceAll("_", " ")}</span>) : <span>No roles</span>}</div></td>
                      <td className={styles.actionCell}>
                        <div className={styles.summaryActions}>
                        {editable && <button type="button" className={styles.editButton} aria-label={`Edit ${accountName(account)}`} onClick={(event) => { event.stopPropagation(); openAccountEditor(account); }}><FiEdit2 aria-hidden /><span>Edit</span></button>}
                        <button type="button" className={styles.expandButton} aria-expanded={expanded} aria-controls={panelId}
                          aria-label={`${expanded ? "Collapse" : "Expand"} details for ${accountName(account)}`}
                          onClick={(event) => { event.stopPropagation(); toggleDetails(); }}>
                          <FiChevronDown size={22} aria-hidden />
                        </button>
                        </div>
                      </td>
                    </tr>
                    <tr className={styles.previewRow} aria-hidden={!expanded || undefined}>
                      <td colSpan={6}>
                        <div id={panelId} className={styles.previewReveal} data-expanded={expanded} inert={!expanded || undefined}>
                          <div className={styles.previewClip}>
                            <AccountDetails account={account} />
                          </div>
                        </div>
                      </td>
                    </tr>
                    </Fragment>
                  );
                })}</tbody>
              </table>
            </div>
          )}

          <nav className={styles.pagination} aria-label="Account pages">
            <button type="button" disabled={page <= 1 || loadingList} onClick={() => setPage((current) => current - 1)}>Previous</button>
            <span>Page {page} of {pagination.totalPages}</span>
            <button type="button" disabled={page >= pagination.totalPages || loadingList} onClick={() => setPage((current) => current + 1)}>Next</button>
          </nav>
        </section>}
      </main>
      {selected && canManageAccountType(user.roles, selected.type) && canEditAccount(user.roles, selected.roles) && <AccountEditor account={selected} currentAccountId={currentAccountId} actorRoles={user.roles || []} options={options} onClose={() => setSelected(null)} onSaved={saved} onMembershipChanged={() => { setSelected(null); setRefreshKey(key => key + 1); }} />}
    </>
  );
}
