export const REGION_BADGE_THEME = {
  amsterdam: {
    background: "#e8f1ff",
    border: "#b6d3ff",
    color: "#014cb2",
  },
  breda_tilburg: {
    background: "#fff0e7",
    border: "#ffc5a0",
    color: "#b74712",
  },
  eindhoven: {
    background: "#fff1e7",
    border: "#ffc7a5",
    color: "#9e4214",
  },
  groningen: {
    background: "#ffe9e8",
    border: "#ffbbb7",
    color: "#b51e18",
  },
  leiden_hague: {
    background: "#f2f6d7",
    border: "#d8de7a",
    color: "#687000",
  },
  leeuwarden: {
    background: "#fff5d6",
    border: "#ffd970",
    color: "#7b5200",
  },
  maastricht: {
    background: "#f1ecff",
    border: "#cbbcff",
    color: "#381096",
  },
  netherlands: {
    background: "#e8f3ef",
    border: "#b9d9ce",
    color: "#017363",
  },
  rotterdam: {
    background: "#e8f0ff",
    border: "#b8ccff",
    color: "#004ab0",
  },
  unassigned: {
    background: "#f1f3f2",
    border: "#d7ded9",
    color: "#59655f",
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
