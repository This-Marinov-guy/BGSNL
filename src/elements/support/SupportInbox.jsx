"use client";
import dynamic from "next/dynamic";
import { useSearchParams } from "@/util/navigation";
import DashboardNavigation from "@/screens/userActions/DashboardNavigation";
import workspace from "@/screens/userActions/dashboard-workspace.module.scss";
import HeaderTwo from "@/component/header/HeaderTwo";
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
    <main className={`container user-workspace-page event-admin-page ${styles.inboxPage} ${ticketId ? styles.inboxDetailPage : workspace.page}`}>
      {!ticketId && <><DashboardNavigation />
      <header className="event-workspace-heading event-dashboard-heading">
        <div>
          <h1>Support tickets</h1>
        </div>
      </header></>}
      <div className={`${styles.embedded} ${ticketId ? styles.inboxChat : ""}`}><SupportDesk staff selectedTicketId={ticketId} onSelectTicket={selectTicket} /></div>
    </main>
  </>;
}
