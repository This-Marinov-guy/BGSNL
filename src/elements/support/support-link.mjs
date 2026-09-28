const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

export function supportTicketFromSearch(search) {
  const values = new URLSearchParams(search).getAll("supportTicket");
  return values.length === 1 && UUID.test(values[0]) ? values[0].toLowerCase() : null;
}

export function supportTicketPath(id, path = "/") {
  if (!UUID.test(id || "")) return path;
  const url = new URL(path, "https://www.bulgariansociety.nl");
  url.searchParams.set("supportTicket", id.toLowerCase());
  return `${url.pathname}${url.search}${url.hash}`;
}
