const regionalNames = Object.freeze({
  amsterdam: "Amsterdam",
  breda_tilburg: "Breda & Tilburg",
  eindhoven: "Eindhoven",
  groningen: "Groningen",
  leiden_hague: "Leiden & Hague",
  leeuwarden: "Leeuwarden",
  maastricht: "Maastricht",
  rotterdam: "Rotterdam",
});

export const EVENT_TICKET_REGIONS = Object.freeze(Object.keys(regionalNames));

export function eventTicketBrand(region) {
  if (typeof region === "string" && Object.hasOwn(regionalNames, region)) {
    return {
      region,
      name: `Bulgarian Society ${regionalNames[region]}`,
      shortName: regionalNames[region],
      logoFile: `${region}.webp`,
      logoUrl: `/assets/images/logo/${region}.webp`,
      appleWordmark: `event-logo-${region}`,
      googleLogoUrl: `/assets/wallet-cards/google/${region}-event-logo.png`,
      googleWideLogoUrl: `/assets/wallet-cards/google/${region}-event-wide-logo.png`,
    };
  }
  return {
    region: "netherlands",
    name: "Bulgarian Society Netherlands",
    shortName: "Netherlands",
    logoFile: "logo-nl-circle.png",
    logoUrl: "/assets/images/logo/logo-nl-circle.png",
    appleWordmark: "event-logo",
    googleLogoUrl: "/assets/wallet-cards/google/netherlands-event-logo.png",
    googleWideLogoUrl: "/assets/wallet-cards/google/netherlands-event-wide-logo.png",
  };
}
