// Keep unchanged row objects and the array itself stable across snapshots.
export function mergeGuestList(current, incoming) {
  const previous = new Map(current.map(guest => [String(guest.id || guest._id), guest]));
  const next = incoming.map(guest => {
    const saved = previous.get(String(guest.id || guest._id));
    return saved && JSON.stringify(saved) === JSON.stringify(guest) ? saved : guest;
  });
  return next.length === current.length && next.every((guest, index) => guest === current[index]) ? current : next;
}
