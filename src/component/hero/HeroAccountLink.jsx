import { useState, useSyncExternalStore } from "react";
import { useSelector } from "react-redux";
import { Skeleton } from "@primereact/ui/skeleton";
import { IconlyProfile } from "@/elements/ui/icons/IconlyIcons";
import { Link } from "@/util/navigation";
import { selectUser } from "@/redux/user";
import styles from "./hero-account.module.scss";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export default function HeroAccountLink() {
  const user = useSelector(selectUser);
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const [imageResult, setImageResult] = useState(null);
  const account = user.session;
  const image = user.image || account?.image || "";
  const imageLoaded = imageResult?.src === image && imageResult.loaded;
  const imageFailed = imageResult?.src === image && !imageResult.loaded;
  const firstInitial = Array.from(String(account?.name || "").trim())[0];
  const surname = String(account?.surname || "").trim();
  const displayName = [firstInitial ? `${firstInitial.toUpperCase()}.` : "", surname]
    .filter(Boolean).join(" ") || "Your profile";

  if (!hydrated || !user.authInitialized) {
    return <div className={styles.profile} role="status" aria-label="Loading your profile" aria-busy="true">
      <Skeleton shape="circle" size="3rem" />
      <span className={styles.copy} aria-hidden="true">
        <Skeleton width="5rem" height="1rem" />
        <Skeleton width="8rem" height="1.25rem" />
      </span>
    </div>;
  }

  if (!account) {
    return <Link className="rn-button-style--2 rn-btn-reverse-green" to="/join-the-society">Join the society</Link>;
  }

  return <Link className={styles.profile} to="/user" aria-label={`Go to profile: ${displayName}`}>
    <span className={styles.avatar} aria-hidden="true">
      {image && !imageFailed ? <>
        {!imageLoaded && <Skeleton shape="circle" size="3rem" />}
        <img src={image} alt="" width={48} height={48}
          className={imageLoaded ? styles.imageLoaded : styles.imagePending}
          onLoad={() => setImageResult({ src: image, loaded: true })}
          onError={() => setImageResult({ src: image, loaded: false })} />
      </> : <IconlyProfile size="1.75rem" />}
    </span>
    <span className={styles.copy}>
      <span>Welcome,</span>
      <strong>{displayName}</strong>
    </span>
  </Link>;
}
