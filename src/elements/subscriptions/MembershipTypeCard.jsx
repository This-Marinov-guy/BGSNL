"use client";

import { useId, useState } from "react";
import Image from "next/image";
import PropTypes from "prop-types";
import { FiAward, FiUsers } from "@/elements/ui/icons/IconlyIcons";
import styles from "./subscriptions.module.scss";

export default function MembershipTypeCard({ membership, selected, disabled, onChoose }) {
  const titleId = useId();
  const [imageStatus, setImageStatus] = useState("loading");
  const isAlumni = membership.type === "alumni";
  const Icon = isAlumni ? FiAward : FiUsers;

  return (
    <article
      aria-labelledby={titleId}
      className={`service service__style--2 text-center ${styles.membershipTypeCard}`}
      data-membership={membership.type}
      data-selected={selected}
    >
      <div className={styles.membershipTypeMedia} aria-busy={imageStatus === "loading"}>
        {imageStatus === "loading" && (
          <span
            role="status"
            aria-label={`Loading ${membership.title} image`}
            className={`${styles.skeletonBlock} ${styles.membershipImageSkeleton}`}
          />
        )}
        {imageStatus === "error" ? (
          <Icon aria-hidden className={styles.membershipImageFallback} />
        ) : (
          <Image
            alt={`Become ${isAlumni ? "an Alumni" : "a Member"}`}
            className={styles.membershipTypeImage}
            data-loaded={imageStatus === "loaded"}
            height={120}
            loading="eager"
            onError={() => setImageStatus("error")}
            onLoad={() => setImageStatus("loaded")}
            src={membership.image}
            width={120}
          />
        )}
      </div>
      <div className={`content ${styles.membershipTypeCopy}`}>
        <h3 className={`title ${styles.membershipTypeTitle}`} id={titleId}>
          <Icon aria-hidden />
          <span>Become {isAlumni ? "an Alumni" : "a Member"}</span>
        </h3>
        <p>{membership.description}</p>
      </div>
      <button
        aria-pressed={selected}
        className={`rn-button-style--2 ${isAlumni ? "rn-btn-solid-gold" : "rn-btn-reverse-green"} ${styles.membershipTypeAction}`}
        disabled={disabled}
        onClick={() => onChoose(membership.type)}
        type="button"
      >
        {disabled ? `${membership.title} unavailable` : `Choose ${membership.title}`}
      </button>
    </article>
  );
}

MembershipTypeCard.propTypes = {
  membership: PropTypes.shape({
    type: PropTypes.oneOf(["member", "alumni"]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
  }).isRequired,
  selected: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  onChoose: PropTypes.func.isRequired,
};
