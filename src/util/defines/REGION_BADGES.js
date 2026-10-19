export const REGION_BADGE_THEME = {
  amsterdam: {
    background: "#234e91",
    border: "#234e91",
    color: "#ffffff",
  },
  breda_tilburg: {
    background: "#934718",
    border: "#934718",
    color: "#ffffff",
  },
  eindhoven: {
    background: "#9e4214",
    border: "#9e4214",
    color: "#ffffff",
  },
  groningen: {
    background: "#9e0d33",
    border: "#9e0d33",
    color: "#ffffff",
  },
  leiden_hague: {
    background: "#5d6500",
    border: "#5d6500",
    color: "#ffffff",
  },
  leeuwarden: {
    background: "#795707",
    border: "#795707",
    color: "#f3f0e8",
  },
  maastricht: {
    background: "#5b2796",
    border: "#5b2796",
    color: "#ffffff",
  },
  netherlands: {
    background: "#017363",
    border: "#017363",
    color: "#ffffff",
  },
  rotterdam: {
    background: "#234e91",
    border: "#234e91",
    color: "#ffffff",
  },
  unassigned: {
    background: "#59655f",
    border: "#59655f",
    color: "#ffffff",
  },
};

export const DEFAULT_REGION_BADGE_THEME = REGION_BADGE_THEME.unassigned;

export const normalizeRegionBadgeKey = (region) => {
  const key = String(region || "").trim().toLowerCase();
  return key || "unassigned";
};

export const getRegionBadgeTheme = (region) => (
  REGION_BADGE_THEME[normalizeRegionBadgeKey(region)] || DEFAULT_REGION_BADGE_THEME
);

export const getRegionBadgeStyle = (region) => {
  const theme = getRegionBadgeTheme(region);
  return {
    "--region-badge-background": theme.background,
    "--region-badge-border": theme.border,
    "--region-badge-color": theme.color,
  };
};

export const formatRegionBadgeLabel = (region) => {
  const key = normalizeRegionBadgeKey(region);
  if (key === "unassigned") return "Not assigned";
  return key
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};
