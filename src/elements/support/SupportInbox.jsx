"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "@/util/navigation";
import HeaderTwo from "@/component/header/HeaderTwo";
import { FiArrowLeft } from "@/elements/ui/icons/IconlyIcons";
import administrationStyles from "@/screens/userActions/administration.module.scss";
import styles from "./support.module.scss";
import SupportLoading from "./SupportLoading";

const SupportDesk = dynamic(() => import("./SupportDesk"), { ssr: false, loading: () => <SupportLoading inset /> });

export default function SupportInbox() {
  const [searchParams, setSearchParams] = useSearchParams();
  const ticketId = searchParams.get("ticket") || null;
  const selectTicket = id => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set("ticket", id); else next.delete("ticket");
    setSearchParams(next);
  };
  return <>
    <HeaderTwo headertransparent="header--transparent" colorblack="color--black" logoname="logo.png" />
    <main className={`container user-workspace-page event-admin-page ${styles.inboxPage} ${ticketId ? styles.inboxDetailPage : ""}`}>
      {!ticketId && <><nav className={administrationStyles.views} aria-label="Support administration">
        <Link className={administrationStyles.backLink} href="/user/dashboard" aria-label="Back to administration">
          <FiArrowLeft size={24} aria-hidden />
          <span>Administration</span>
        </Link>
      </nav>
      <header className="event-workspace-heading event-dashboard-heading">
        <div>
          <h1>Support tickets</h1>
          <p>Reply to reports, follow up with visitors and keep each conversation’s status up to date.</p>
        </div>
      </header></>}
      <div className={`${styles.embedded} ${ticketId ? styles.inboxChat : ""}`}><SupportDesk staff selectedTicketId={ticketId} onSelectTicket={selectTicket} /></div>
    </main>
  </>;
}
