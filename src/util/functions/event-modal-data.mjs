// Convert persisted events and incomplete drafts to the same settings shape
// used by the event form preview, without changing the stored record.
export function eventModalData(event) {
  const isDraft = event.status === "draft";
  const draft = isDraft ? event.draftData ?? {} : {};
  const codes = Array.isArray(event.product?.promoCodes) ? event.product.promoCodes : [];
  return {
    ...event,
    ...draft,
    id: event.id ?? event._id,
    status: event.status,
    readyToPublish: event.readyToPublish,
    region: event.region,
    poster: event.poster ?? draft.poster,
    ticketImg: event.ticketImg ?? draft.ticketImg,
    images: event.images ?? draft.images ?? [],
    isTicketLink: isDraft ? draft.isTicketLink ?? Boolean(event.ticketLink) : Boolean(event.ticketLink),
    product: isDraft ? {
      guest: { price: draft.guestPrice },
      member: { price: draft.memberPrice },
      activeMember: { price: draft.activeMemberPrice },
    } : event.product,
    guestPromotion: isDraft ? draft.guestPromotion : event.promotion?.guest,
    memberPromotion: isDraft ? draft.memberPromotion : event.promotion?.member,
    promoCodes: isDraft ? draft.promoCodes : { isEnabled: codes.length > 0, codes },
  };
}
