"use client";
import dynamic from "next/dynamic";
import UserTabHeader from "@/elements/ui/tabs/UserTabHeader";
import styles from "./support.module.scss";
import SupportLoading from "./SupportLoading";
import AccountFaq from "./AccountFaq";
import VladiImage from "@/elements/ui/media/VladiImage";
const SupportDesk = dynamic(() => import("./SupportDesk"), { ssr: false, loading: () => <SupportLoading inset /> });

export default function HelpSection() {
  return <div className="tab-content-wrapper">
    <UserTabHeader title="Help & recommendations" />
    <div className={`tab-body ${styles.helpSection}`}>
    <AccountFaq />
    <div className={styles.embedded}><SupportDesk welcomeImage={
      <VladiImage className={styles.helpPortrait} src="/assets/images/vladi/welcome2.png" alt="Vladi, your BGSNL support guide" width={373} height={669} sizes="112px" />
    } /></div>
  </div></div>;
}
