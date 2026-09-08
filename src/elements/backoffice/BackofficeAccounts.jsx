"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import HeaderTwo from "@/component/header/HeaderTwo";
import { FiEdit2, FiSearch, FiUsers, IconlyClose } from "@/elements/ui/icons/IconlyIcons";
import FilterPanel from "@/elements/ui/filters/FilterPanel";
import { useHttpClient } from "@/hooks/common/http-hook";
import { showNotification } from "@/redux/notification";
import { selectUser } from "@/redux/user";
import { decodeJWT } from "@/util/functions/authorization";
import { capitalizeFirstLetter } from "@/util/functions/capitalize";
import styles from "./backoffice.module.scss";

const EMPTY_OPTIONS = { cities: [], roles: [], statuses: [] };
const ROLE_LABELS = {
  member: "Member",
  alumni: "Alumni",
  active_member: "Active member",
  committee_member: "Committee member",
  board_member: "Board member",
  society_board_member: "Society board member",
  admin: "Admin",
  support: "Support",
  vip: "VIP",
  super_admin: "Super admin",
};
const ACCOUNT_TYPE_ROLES = new Set(["member", "alumni"]);

const formatDateInput = (value) => value ? String(value).slice(0, 10) : "";
const formatCity = (value) => value ? capitalizeFirstLetter(value, true) : "Not assigned";
const accountName = (account) => `${account.name || ""} ${account.surname || ""}`.trim() || account.email;
const accountInitials = (account) => `${account.name?.[0] || ""}${account.surname?.[0] || ""}`.toUpperCase();

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
  roles: Array.isArray(account.roles)
    ? account.roles.filter((role) => !ACCOUNT_TYPE_ROLES.has(role))
    : [],
});

function AccountEditor({ account, currentAccountId, options, onClose, onSaved }) {
  const [form, setForm] = useState(() => editorState(account));
  const [saving, setSaving] = useState(false);
  const { sendRequest } = useHttpClient();
  const dispatch = useDispatch();
  const titleRef = useRef(null);
  const isSelf = currentAccountId === account.id;
  const statuses = options.statuses.includes(form.status)
    ? options.statuses
    : [form.status, ...options.statuses].filter(Boolean);

  useEffect(() => {
    titleRef.current?.focus();
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const toggleRole = (role) => {
    if (ACCOUNT_TYPE_ROLES.has(role) || isSelf) return;
    setForm((current) => ({
      ...current,
      roles: current.roles.includes(role)
        ? current.roles.filter((item) => item !== role)
        : [...current.roles, role],
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
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
    <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={styles.editor} role="dialog" aria-modal="true" aria-labelledby="account-editor-title">
        <header className={styles.editorHeader}>
          <div>
            <AccountAvatar key={account.image || "initials"} account={account} />
            <div>
              <h2 id="account-editor-title" ref={titleRef} tabIndex={-1}>{accountName(account)}</h2>
              <p>{account.type === "alumni" ? "Alumni account" : "Member account"}</p>
            </div>
          </div>
          <button className={styles.iconButton} type="button" onClick={onClose} aria-label="Close account editor"><IconlyClose /></button>
        </header>

        <form className={styles.editorForm} onSubmit={submit}>
          <fieldset>
            <legend>Contact details</legend>
            <div className={styles.fieldGrid}>
              <EditorField id="account-editor-name" label="First name"><input id="account-editor-name" className="bgsnl-form-control" name="name" value={form.name} onChange={change} required /></EditorField>
              <EditorField id="account-editor-surname" label="Last name"><input id="account-editor-surname" className="bgsnl-form-control" name="surname" value={form.surname} onChange={change} required /></EditorField>
              <EditorField className={styles.fullField} id="account-editor-email" label="Email"><input id="account-editor-email" className="bgsnl-form-control" name="email" type="email" value={form.email} onChange={change} required /></EditorField>
              <EditorField id="account-editor-phone" label="Mobile number"><input id="account-editor-phone" className="bgsnl-form-control" name="phone" type="tel" value={form.phone} onChange={change} required={account.type === "member"} /></EditorField>
              <EditorField id="account-editor-birth" label="Date of birth"><input id="account-editor-birth" className="bgsnl-form-control" name="birth" type="date" value={form.birth} onChange={change} required={account.type === "member"} /></EditorField>
              <EditorField className={styles.fullField} id="account-editor-region" label="City"><select id="account-editor-region" className="bgsnl-form-control" name="region" value={form.region} onChange={change}><option value="">Not assigned</option>{options.cities.map((city) => <option value={city} key={city}>{formatCity(city)}</option>)}</select></EditorField>
            </div>
          </fieldset>

          <fieldset>
            <legend>Education and work</legend>
            <div className={styles.fieldGrid}>
              <EditorField className={styles.fullField} id="account-editor-university" label="University"><input id="account-editor-university" className="bgsnl-form-control" name="university" value={form.university} onChange={change} /></EditorField>
              <EditorField className={styles.fullField} id="account-editor-other-university" label="Other university name"><input id="account-editor-other-university" className="bgsnl-form-control" name="otherUniversityName" value={form.otherUniversityName} onChange={change} /></EditorField>
              <EditorField id="account-editor-graduation" label="Graduation year"><input id="account-editor-graduation" className="bgsnl-form-control" name="graduationDate" value={form.graduationDate} onChange={change} /></EditorField>
              <EditorField id="account-editor-student-number" label="Student number"><input id="account-editor-student-number" className="bgsnl-form-control" name="studentNumber" value={form.studentNumber} onChange={change} /></EditorField>
              <EditorField className={styles.fullField} id="account-editor-course" label="Study programme"><input id="account-editor-course" className="bgsnl-form-control" name="course" value={form.course} onChange={change} /></EditorField>
              <EditorField className={styles.fullField} id="account-editor-profession" label="Profession"><input id="account-editor-profession" className="bgsnl-form-control" name="profession" value={form.profession} onChange={change} /></EditorField>
            </div>
          </fieldset>

          <fieldset>
            <legend>Access and status</legend>
            {isSelf && <p className={styles.selfNotice}>Your own roles and status are protected to prevent accidental loss of access.</p>}
            <EditorField className={styles.statusField} id="account-editor-status" label="Account status"><select id="account-editor-status" className="bgsnl-form-control" name="status" value={form.status} onChange={change} disabled={isSelf}>{statuses.map((status) => <option value={status} key={status}>{status.replaceAll("_", " ")}</option>)}</select></EditorField>
            <div className={styles.roles} aria-label="Account roles">
              {options.roles.filter((role) => !ACCOUNT_TYPE_ROLES.has(role)).map((role) => {
                return <label key={role} className={styles.roleOption}><input type="checkbox" checked={form.roles.includes(role)} disabled={isSelf} onChange={() => toggleRole(role)} /><span>{ROLE_LABELS[role] || role.replaceAll("_", " ")}</span></label>;
              })}
            </div>
          </fieldset>

          <footer className={styles.editorFooter}>
            <button type="button" className={styles.secondaryButton} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.primaryButton} disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}

AccountEditor.propTypes = {
  account: PropTypes.object.isRequired,
  currentAccountId: PropTypes.string,
  options: PropTypes.shape({
    cities: PropTypes.arrayOf(PropTypes.string),
    roles: PropTypes.arrayOf(PropTypes.string),
    statuses: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};

export default function BackofficeAccounts() {
  const [type, setType] = useState("member");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [page, setPage] = useState(1);
  const [accounts, setAccounts] = useState([]);
  const [options, setOptions] = useState(EMPTY_OPTIONS);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [selected, setSelected] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const requestSequence = useRef(0);
  const user = useSelector(selectUser);
  const { sendRequest } = useHttpClient();
  const sendRequestRef = useRef(sendRequest);
  sendRequestRef.current = sendRequest;
  const currentAccountId = useMemo(() => {
    try { return user.token ? decodeJWT(user.token).userId : ""; } catch { return ""; }
  }, [user.token]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let active = true;
    const sequence = ++requestSequence.current;
    const params = new URLSearchParams({ type, page: String(page), pageSize: "25" });
    if (search) params.set("search", search);
    if (city) params.set("city", city);
    setLoadingList(true);
    sendRequestRef.current(`backoffice/accounts?${params}`, "GET", null, {}, true, false)
      .then((response) => {
        if (!active || sequence !== requestSequence.current || !response) return;
        setAccounts(response.accounts || []);
        setOptions(response.options || EMPTY_OPTIONS);
        setPagination({ total: response.total || 0, totalPages: response.totalPages || 1 });
      })
      .finally(() => active && sequence === requestSequence.current && setLoadingList(false));
    return () => { active = false; };
  }, [type, page, search, city]);

  const chooseType = (nextType) => {
    setType(nextType);
    setPage(1);
    setSelected(null);
  };

  const saved = (account) => {
    setAccounts((current) => current.map((item) => item.id === account.id ? account : item));
    setSelected(null);
  };

  return (
    <>
      <HeaderTwo headertransparent="header--transparent" colorblack="color--black" logoname="logo.png" />
      <main className={styles.page}>
        <header className={styles.pageHeader}>
          <div className={styles.headingIcon} aria-hidden><FiUsers /></div>
          <div><h1>Accounts back office</h1><p>Find and manage member and alumni profiles, account status and administrative roles.</p></div>
        </header>

        <div className={styles.tabs} role="tablist" aria-label="Account type">
          <button type="button" role="tab" aria-selected={type === "member"} onClick={() => chooseType("member")}>Members</button>
          <button type="button" role="tab" aria-selected={type === "alumni"} onClick={() => chooseType("alumni")}>Alumni</button>
        </div>

        <section className={styles.directory} aria-label={`${type} directory`}>
          <FilterPanel
            controlsClassName={styles.filters}
            summary={(
              <span aria-live="polite">
                {loadingList ? "Loading accounts…" : `${pagination.total} ${type === "alumni" ? "alumni" : pagination.total === 1 ? "member" : "members"}`}
              </span>
            )}
            title="Filter accounts"
          >
            <label className={styles.searchField}><span>Search name, email or number</span><div><FiSearch aria-hidden /><input className="bgsnl-form-control" type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} /></div></label>
            <label><span>City</span><select className="bgsnl-form-control" value={city} onChange={(event) => { setCity(event.target.value); setPage(1); }}><option value="">All cities</option>{options.cities.map((item) => <option key={item} value={item}>{formatCity(item)}</option>)}<option value="unassigned">Not assigned</option></select></label>
          </FilterPanel>

          {!loadingList && accounts.length === 0 ? (
            <div className={styles.empty}><FiUsers aria-hidden /><h2>No accounts found</h2><p>Try a different search or city filter.</p></div>
          ) : (
            <div className={styles.tableWrap} aria-busy={loadingList}>
              <table>
                <thead><tr><th>Account</th><th>Contact</th><th>City</th><th>Status</th><th>Roles</th><th><span className={styles.visuallyHidden}>Actions</span></th></tr></thead>
                <tbody>{accounts.map((account) => <tr key={account.id}>
                  <td data-label="Account"><div className={styles.person}><AccountAvatar key={account.image || "initials"} account={account} /><div><strong>{accountName(account)}</strong><small>{account.id === currentAccountId ? "Your account" : account.type === "alumni" ? "Alumni" : "Member"}</small></div></div></td>
                  <td data-label="Contact"><a href={`mailto:${account.email}`}>{account.email}</a><small>{account.phone || "No mobile number"}</small></td>
                  <td data-label="City">{formatCity(account.region)}</td>
                  <td data-label="Status"><span className={styles.status} data-status={account.status}>{account.status.replaceAll("_", " ")}</span></td>
                  <td data-label="Roles"><div className={styles.roleTags}>{account.roles.map((role) => <span key={role}>{ROLE_LABELS[role] || role.replaceAll("_", " ")}</span>)}</div></td>
                  <td className={styles.actionCell}><button type="button" className={styles.editButton} onClick={() => setSelected(account)}><FiEdit2 aria-hidden /><span>Edit</span></button></td>
                </tr>)}</tbody>
              </table>
              {loadingList && <div className={styles.loadingOverlay} role="status">Loading accounts…</div>}
            </div>
          )}

          <nav className={styles.pagination} aria-label="Account pages">
            <button type="button" disabled={page <= 1 || loadingList} onClick={() => setPage((current) => current - 1)}>Previous</button>
            <span>Page {page} of {pagination.totalPages}</span>
            <button type="button" disabled={page >= pagination.totalPages || loadingList} onClick={() => setPage((current) => current + 1)}>Next</button>
          </nav>
        </section>
      </main>
      {selected && <AccountEditor account={selected} currentAccountId={currentAccountId} options={options} onClose={() => setSelected(null)} onSaved={saved} />}
    </>
  );
}
