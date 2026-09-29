export function modalKey(value) {
  return String(value || "dialog")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "dialog";
}

export function updateModalUrl(href, key, open) {
  const url = new URL(href);
  const values = url.searchParams.getAll("modal");
  if (open) {
    if (!values.includes(key)) url.searchParams.append("modal", key);
  } else {
    url.searchParams.delete("modal");
    values.filter((value) => value !== key).forEach((value) => url.searchParams.append("modal", value));
  }
  return `${url.pathname}${url.search}${url.hash}`;
}
