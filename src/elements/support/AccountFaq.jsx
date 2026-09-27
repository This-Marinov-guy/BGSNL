"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/user";
import AppModal from "@/elements/ui/modals/AppModal";
import AnimatedDisclosure from "@/elements/ui/functional/AnimatedDisclosure";
import { IconlyCalendar, IconlyProfile, IconlyWallet, IconlyLock, IconlyMessage, IconlyDocument, FiSearch } from "@/elements/ui/icons/IconlyIcons";
import { getFaqSections, normalizeFaqSearch, searchFaqSections } from "./faq-content.mjs";
import styles from "./faq.module.scss";

const ICONS = { events: IconlyCalendar, memberships: IconlyProfile, payments: IconlyWallet, access: IconlyLock, support: IconlyMessage, terms: IconlyDocument };

export default function AccountFaq() {
  const user = useSelector(selectUser);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const headingId = useId();
  const searchId = useId();
  const sidebarSearchId = useId();
  const sections = getFaqSections(user);
  // Derive the open answers on every render so role/status changes cannot
  // leave stale privileged guidance visible in an already-open sidebar.
  const section = sections.find(item => item.id === selected);
  const searching = selected === "search";
  const normalizedQuery = normalizeFaqSearch(query);
  const shownSections = searching ? searchFaqSections(user, query) : section ? [section] : [];
  const resultCount = shownSections.reduce((total, item) => total + item.questions.length, 0);
  const close = () => setSelected(null);

  return <>
    <section className={styles.panel} aria-labelledby={headingId}>
      <h2 id={headingId} className="type-subheading">Frequently asked questions</h2>
      <form className={styles.search} role="search" aria-label="Search FAQs" onSubmit={event => { event.preventDefault(); setSelected("search"); }}>
        <div className={styles.searchControls}>
          <div className={`rn-form-group ${styles.searchField}`}>
            <label htmlFor={searchId}>Search FAQs</label>
            <input id={searchId} type="search" value={query} onChange={event => setQuery(event.target.value)}  />
          </div>
          <button type="submit" aria-label="Search FAQs"><FiSearch size={22} aria-hidden="true" /></button>
        </div>
      </form>
      <div className={styles.grid}>
        {sections.map(item => {
          const Icon = ICONS[item.id];
          return <button key={item.id} type="button" className={styles.topic} aria-haspopup="dialog" onClick={() => setSelected(item.id)}>
            <Icon size={28} aria-hidden="true" />
            <span>{item.label}</span>
          </button>;
        })}
      </div>
    </section>
    <AppModal open={Boolean(section) || searching} onClose={close} title={searching ? "Search FAQs" : section ? `${section.label} FAQs` : "FAQs"}
      maximizable={false} dismissableMask maskClassName={styles.mask} className={styles.sidebar} contentClassName={styles.body}>
      <div className={styles.search}>
        <div className={`rn-form-group ${styles.searchField}`}>
          <label htmlFor={sidebarSearchId}>Search all FAQs</label>
          <input id={sidebarSearchId} type="search" value={searching ? query : ""}
            onChange={event => { setQuery(event.target.value); setSelected("search"); }}  />
        </div>
      </div>
      {searching && <p className={styles.resultCount} role="status">{resultCount} {resultCount === 1 ? "answer" : "answers"} found</p>}
      <div className={styles.questions}>
        {shownSections.map(topic => <section key={topic.id} className={styles.questions} aria-label={`${topic.label} answers`}>
          {searching && <h3 className={styles.resultHeading}>{topic.label}</h3>}
          {topic.questions.map(item => <AnimatedDisclosure key={`${item.id}:${searching ? normalizedQuery : "topic"}`} summary={item.question} className={styles.question} defaultOpen={searching && Boolean(normalizedQuery)}>
            <p>{item.answer}</p>
            {item.link && <Link href={item.link.href} onClick={close}>{item.link.label}</Link>}
          </AnimatedDisclosure>)}
        </section>)}
        {!resultCount && <p>{searching ? "No matching FAQs. Try different words or send us a support report in Help." : "No FAQs are available for this topic yet. You can send us a report or recommendation in Help."}</p>}
      </div>
    </AppModal>
  </>;
}
