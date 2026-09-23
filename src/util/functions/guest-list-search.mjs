const normalize = value => String(value ?? "").normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();

export function filterGuestList(guests, query) {
  const needle = normalize(query).trim();
  if (!needle) return guests;
  const phoneQuery = /^[+\d\s().-]+$/.test(needle) ? needle.replace(/\D/g, "") : "";
  return guests.filter(guest =>
    [guest.name, guest.email, guest.phone, guest.transactionId].some(value => normalize(value).includes(needle)) ||
    (phoneQuery && String(guest.phone ?? "").replace(/\D/g, "").includes(phoneQuery))
  );
}
