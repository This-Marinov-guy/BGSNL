"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import localFont from "next/font/local";
import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import spec from "@assets/wallet-cards/v1/specifications.json";
import CometCard from "@/elements/ui/cards/CometCard";
import { FaTicketAlt, FiArrowLeft, FiArrowRight, FiEye, FiUser } from "@/elements/ui/icons/IconlyIcons";
import styles from "@/screens/private/WalletCardPreview.module.scss";

const archive = localFont({ src: "../../../public/assets/fonts/Archive-Regular.ttf", weight: "400" });
const spartan = localFont({ src: "../../../public/assets/fonts/LeagueSpartan.ttf", weight: "100 900" });
const ImageGallery = dynamic(() => import("@/elements/ui/media/ImageGallery"), { ssr: false });
const TICKETS_PER_PAGE = 4;

export default function DigitalMembershipCard({ card, qrImage, tickets = [] }) {
  const [showTickets, setShowTickets] = useState(false);
  const [ticketPage, setTicketPage] = useState(0);
  const [pageDirection, setPageDirection] = useState(1);
  const [previewIndex, setPreviewIndex] = useState(null);
  const reduceMotion = useReducedMotion();
  const orderedTickets = useMemo(() => [...tickets].reverse(), [tickets]);
  const pageCount = Math.ceil(orderedTickets.length / TICKETS_PER_PAGE);
  const pageStart = ticketPage * TICKETS_PER_PAGE;
  const visibleTickets = orderedTickets.slice(pageStart, pageStart + TICKETS_PER_PAGE);
  const galleryImages = useMemo(() => orderedTickets.map((ticket, index) => ({
    src: ticket,
    alt: `Ticket ${index + 1}`,
    download: { url: ticket, filename: `ticket-${index + 1}.png` },
  })), [orderedTickets]);
  const previewTicket = previewIndex === null ? null : orderedTickets[previewIndex];

  useEffect(() => {
    setTicketPage((current) => Math.min(current, Math.max(0, pageCount - 1)));
  }, [pageCount]);

  const changePage = (direction) => {
    const nextPage = ticketPage + direction;
    if (nextPage < 0 || nextPage >= pageCount) return;
    setPageDirection(direction);
    setTicketPage(nextPage);
  };

  return <>
    <div className={styles.cardToolbar}>
      <div className={styles.status} role="status" data-status={card.status}>{card.status === "active" ? "Active" : "Locked"}</div>
      <button
        aria-controls="membership-card-tickets"
        aria-expanded={showTickets}
        className={styles.ticketsToggle}
        onClick={() => setShowTickets((visible) => !visible)}
        type="button"
      >
        {showTickets ? <FiUser size={18} /> : <FaTicketAlt size={18} />}
        <span>{showTickets ? "Membership card" : "Tickets"}</span>
      </button>
    </div>
    <div className={styles.flipShell} data-flipped={showTickets}>
      <div className={`${styles.cardFace} ${styles.membershipFace}`} aria-hidden={showTickets}>
        <CometCard>
          <article className={`${styles.card} ${styles.membershipCard}`} aria-label="Digital membership card">
            <Image className={styles.background} src="/assets/wallet-cards/v1/card-background.png" alt="" fill sizes="(max-width: 600px) 100vw, 540px" priority />
            <div className={styles.portrait}>
              <Image src={card.profileImage} alt={`${card.firstName} ${card.surname}`} fill sizes="232px" referrerPolicy="no-referrer"
                onError={(event) => { event.currentTarget.src = "/assets/images/avatars/bg_other_avatar_1.jpeg"; }} />
            </div>
            <div className={styles.memberText}>
              <h2 className={archive.className} style={{ fontSize: `${spec.design.typography.name.fontSize / 10.8}cqw` }}>{card.firstName} {card.surname}</h2>
              <p className={spartan.className} style={{ fontSize: `${spec.design.typography.membershipLabel.fontSize / 10.8}cqw` }}>{card.membershipLabel}</p>
            </div>
            <div className={styles.qr}><Image src={qrImage} alt="Membership card QR code" width={384} height={384} unoptimized /></div>
          </article>
        </CometCard>
      </div>
      <section
        aria-hidden={!showTickets}
        aria-label="Member tickets"
        className={`${styles.card} ${styles.cardFace} ${styles.ticketFace}`}
        id="membership-card-tickets"
      >
        <header className={styles.ticketHeader}>
          <h2 className={archive.className}>{card.firstName}&apos;s tickets</h2>
        </header>
        {orderedTickets.length ? (
          <div className={styles.ticketPages} aria-live="polite">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className={styles.ticketGrid}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: pageDirection * -24 }}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: pageDirection * 24 }}
                key={ticketPage}
                transition={{ duration: reduceMotion ? 0.01 : 0.28, ease: "easeOut" }}
              >
                {visibleTickets.map((ticket, index) => (
                  <button
                    aria-label={`Preview ticket ${pageStart + index + 1}`}
                    className={styles.ticketThumbnail}
                    key={`${ticket}-${pageStart + index}`}
                    onClick={() => setPreviewIndex(pageStart + index)}
                    tabIndex={showTickets ? 0 : -1}
                    type="button"
                  >
                    <Image alt={`Ticket ${pageStart + index + 1}`} fill sizes="(max-width: 600px) 66vw, 360px" src={ticket} unoptimized />
                    <span className={styles.ticketPreviewCue} aria-hidden="true"><FiEye /></span>
                  </button>
                ))}
              </motion.div>
            </AnimatePresence>
            {pageCount > 1 ? <>
              <button
                aria-label="Previous ticket page"
                className={`${styles.ticketPageArrow} ${styles.ticketPageArrowPrevious}`}
                disabled={!showTickets || ticketPage === 0}
                onClick={() => changePage(-1)}
                type="button"
              ><FiArrowLeft size={22} /></button>
              <button
                aria-label="Next ticket page"
                className={`${styles.ticketPageArrow} ${styles.ticketPageArrowNext}`}
                disabled={!showTickets || ticketPage === pageCount - 1}
                onClick={() => changePage(1)}
                type="button"
              ><FiArrowRight size={22} /></button>
            </> : null}
          </div>
        ) : (
          <div className={styles.ticketEmpty}>
            <FaTicketAlt size={42} />
            <h3 className={spartan.className}>No tickets yet</h3>
            <p>Your event tickets will appear here.</p>
          </div>
        )}
      </section>
    </div>
    {previewTicket ? <ImageGallery
      alt={`Ticket ${previewIndex + 1}`}
      fileName={`ticket-${previewIndex + 1}.png`}
      images={galleryImages}
      onClose={() => setPreviewIndex(null)}
      open
      src={previewTicket}
    /> : null}
  </>;
}
DigitalMembershipCard.propTypes = { card: PropTypes.shape({ firstName: PropTypes.string.isRequired, surname: PropTypes.string.isRequired,
  profileImage: PropTypes.string.isRequired, membershipLabel: PropTypes.string.isRequired, status: PropTypes.oneOf(["active", "locked"]).isRequired }).isRequired,
qrImage: PropTypes.string.isRequired,
tickets: PropTypes.arrayOf(PropTypes.string) };
