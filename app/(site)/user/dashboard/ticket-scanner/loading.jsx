import { LoadingSkeleton } from "@/elements/ui/loading/LoadState";
import ScannerHeader from "@/screens/redirects/ScannerHeader";
import styles from "@/screens/redirects/check-ticket.module.scss";

export default function Loading() {
  return <>
    <ScannerHeader />
    <main className="container" style={{ paddingBlock: "5rem" }}>
      <header className={styles.heading}><h1 className="page-breadcrumb__title archive">Ticket scanner</h1></header>
      <LoadingSkeleton label="Loading ticket scanner" variant="cards" />
    </main>
  </>;
}
