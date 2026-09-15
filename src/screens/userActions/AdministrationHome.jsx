"use client";
import { useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import HeaderTwo from "@/component/header/HeaderTwo";
import { Dialog } from "@/compat/primereact";
import { selectUser } from "@/redux/user";
import { showNotification } from "@/redux/notification";
import { useHttpClient } from "@/hooks/common/http-hook";
import { administrationAreas, canAdminister } from "@/util/administration.mjs";
import styles from "./administration.module.scss";

export default function AdministrationHome() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const { sendRequest } = useHttpClient();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [sending, setSending] = useState(false);
  const available = administrationAreas.filter((area) => canAdminister(area, user.roles));
  const missing = administrationAreas.filter((area) => !canAdminister(area, user.roles));
  const submit = async (event) => {
    event.preventDefault();
    if (sending || !selected.length) return;
    setSending(true);
    try {
      const result = await sendRequest("backoffice/access-requests", "POST", { accesses: selected });
      if (result?.accepted) {
        dispatch(showNotification({ severity: "success", detail: "Your access request has been queued for review." }));
        setOpen(false); setSelected([]);
      }
    } finally { setSending(false); }
  };
  return <><HeaderTwo headertransparent="header--transparent" colorblack="color--black" logoname="logo.png" />
    <main className={`container user-workspace-page ${styles.page}`}>
      <header className={styles.heading}><h1>Administration</h1>
        <p>Choose an area to manage. Your existing permissions and regional access apply.</p></header>
      {available.length ? <div className={styles.grid}>{available.map((area) => <Link className={styles.card} href={`/user/dashboard/${area.id}`} key={area.id}>
        <h2>{area.title}</h2><p>{area.description}</p><span>Open {area.title.toLowerCase()} <span aria-hidden>↗</span></span>
      </Link>)}</div> : <p className={styles.empty}>You don’t have administration access yet. Request the areas you need below.</p>}
      <section className={styles.banner} aria-labelledby="access-request-heading"><div><h2 id="access-request-heading">Need access to another area?</h2>
        <p>{missing.length ? "Tell the team what you need. Your account ID, email and requested areas will be included for review." : "Your account already has access to every administration area."}</p></div>
        {missing.length > 0 && <button className="rn-button-style--2 rn-btn-green" type="button" onClick={() => setOpen(true)}>Request access</button>}
      </section>
    </main>
    <Dialog visible={open} onHide={() => { if (!sending) setOpen(false); }} header="Request administration access" closable={!sending} dismissableMask={!sending}>
      <form className={styles.form} onSubmit={submit}><p>Select the areas you need. Requests are reviewed by the team before access is granted.</p>
        <fieldset disabled={sending}><legend>Requested access</legend>{missing.map((area) => <label key={area.id}>
          <input type="checkbox" checked={selected.includes(area.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, area.id] : current.filter((id) => id !== area.id))} />
          <span>{area.title}</span></label>)}</fieldset>
        <button className="rn-button-style--2 rn-btn-green" type="submit" disabled={sending || !selected.length}>{sending ? "Sending…" : "Send request"}</button>
      </form>
    </Dialog>
  </>;
}
