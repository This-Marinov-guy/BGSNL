export function versionedApiBase(configured) {
  return `${configured.replace(/\/+$/, "").replace(/\/v1$/, "")}/v1`;
}
