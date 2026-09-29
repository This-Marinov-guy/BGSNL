"use client";

import PropTypes from "prop-types";
import { useRouter } from "next/navigation";
import { LoadErrorBanner } from "@/elements/ui/loading/LoadState";

export default function PublicContentUnavailable({ content = "This content" }) {
  const router = useRouter();
  return <LoadErrorBanner message={`${content} is temporarily unavailable. Please try again shortly.`} onRetry={() => router.refresh()} />;
}

PublicContentUnavailable.propTypes = { content: PropTypes.string };
