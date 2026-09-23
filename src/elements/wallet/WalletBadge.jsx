"use client";

import Image from "next/image";
import PropTypes from "prop-types";
import ImageTooltip from "@/elements/ui/media/ImageTooltip";
import styles from "./wallet.module.scss";

export default function WalletBadge({ provider, busy = false, disabled = false, unavailableReason = "This wallet is not available right now.", onClick }) {
  if (!["apple", "google"].includes(provider)) return null;
  const apple = provider === "apple";
  const unavailable = disabled || busy;
  const label = `Add to ${apple ? "Apple" : "Google"} Wallet`;
  const button = <button type="button" className={styles.badge} aria-label={label}
    disabled={unavailable} aria-busy={busy} onClick={unavailable ? undefined : onClick}>
    <Image src={apple ? "/assets/wallet-cards/buttons/add-to-apple-wallet.svg"
      : "/assets/commercial/enUS_add_to_google_wallet_wallet-button.svg"}
      alt={`Add to ${apple ? "Apple" : "Google"} Wallet`} width={apple ? 110.739 : 283} height={apple ? 35.016 : 50} unoptimized />
  </button>;
  // While a request is in flight, preserve the button in its disabled state.
  // The progress feedback is announced through the loading toast instead.
  if (!disabled || busy) return button;
  return <ImageTooltip label={unavailableReason} openOnClick>
    <span className={styles.disabledBadge} tabIndex={0} role="group" aria-label={`${label} unavailable`}>
      {button}
    </span>
  </ImageTooltip>;
}

WalletBadge.propTypes = { provider: PropTypes.oneOf(["apple", "google"]).isRequired,
  busy: PropTypes.bool, disabled: PropTypes.bool, unavailableReason: PropTypes.string, onClick: PropTypes.func.isRequired };
