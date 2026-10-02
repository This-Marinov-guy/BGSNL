"use client";

import PropTypes from "prop-types";
import { useRegionEmails } from "@/hooks/common/use-region-emails";
import { LoadingSkeleton, RetryButton } from "@/elements/ui/loading/LoadState";

export default function RegionEmailLink({ region = "netherlands", className, children, label }) {
  const { emails, loading, retry } = useRegionEmails();
  const email = Object.hasOwn(emails, region) ? emails[region] : undefined;
  if (email) return <a className={className} href={`mailto:${email}`} aria-label={label}>{children || email}</a>;
  if (loading) return <LoadingSkeleton label="Loading contact email" variant="inline" />;
  return <span role="status">{children ? null : "Email unavailable "}<RetryButton onClick={retry} label="Retry loading contact email" /></span>;
}

RegionEmailLink.propTypes = {
  region: PropTypes.string, className: PropTypes.string, children: PropTypes.node, label: PropTypes.string,
};
