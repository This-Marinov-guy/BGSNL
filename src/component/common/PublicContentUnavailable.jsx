"use client";

import PropTypes from "prop-types";
import { useRouter } from "next/navigation";
import RetryIcon from "@/elements/ui/icons/RetryIcon";

export default function PublicContentUnavailable({ content = "This content" }) {
  const router = useRouter();
  return <div className="empty-state" role="status">
    <p>{content} is temporarily unavailable. Please try again shortly.</p>
    <button type="button" className="recovery-btn-primary" onClick={() => router.refresh()}>
      <RetryIcon />Try again
    </button>
  </div>;
}

PublicContentUnavailable.propTypes = { content: PropTypes.string };
