"use client";

import { useId, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog } from "@/compat/primereact";
import { selectUser } from "@/redux/user";
import { showNotification } from "@/redux/notification";
import { useHttpClient } from "@/hooks/common/http-hook";
import { administrationAreas, canAdminister } from "@/util/administration.mjs";
import styles from "@/screens/userActions/administration.module.scss";

export default function AccessRequestBanner() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const { sendRequest } = useHttpClient();
  const headingId = useId();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [sending, setSending] = useState(false);
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

  return <>
    <section className={styles.banner} aria-labelledby={headingId}>
      <div><h2 id={headingId}>Need access to another area?</h2>
        <p>{missing.length ? "Tell the team what you need. Your account ID, email and requested areas will be included for review." : "Your account already has access to every administration area."}</p>
      </div>
      {missing.length > 0 && <button className="rn-button-style--2 rn-btn-green" type="button" onClick={() => setOpen(true)}>Request access</button>}
    </section>
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
