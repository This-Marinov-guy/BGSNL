export const SUPPORT_FILE_ACCEPT = "image/jpeg,image/png,image/webp,application/pdf,text/plain,.pdf,.txt";
const TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf", "text/plain"]);

export function validateSupportFiles(current, selected) {
  if (current.length + selected.length > 3) return "Attach up to 3 files.";
  if (selected.some(file => !TYPES.has(file.type))) return "Choose JPEG, PNG, WebP, PDF or text files.";
  if (selected.some(file => !file.size || file.size > 5 * 1024 * 1024)) return "Each file must be non-empty and 5 MB or smaller.";
  return "";
}
