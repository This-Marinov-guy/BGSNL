// Native wallets control text layout. Keep the full public card label while
// dividing longer role labels into the fields each platform can display.
export function nativeMembershipFields(label) {
  const alumni = /^(Alumni Tier (?:0|I|II|III|IV)) & (.+)$/.exec(label);
  const membership = alumni ? alumni[1] : label;
  const role = alumni?.[2] || "";
  const regional = /^(Board Member|Committee Member) of (.+)$/.exec(role || membership);
  if (regional) return {
    membership: alumni ? membership : regional[1],
    subtitle: alumni ? `${regional[1]} · ${regional[2]}` : regional[2],
    additional: alumni
      ? [{ key: "role", label: "ROLE", value: regional[1] }, { key: "region", label: "REGION", value: regional[2] }]
      : [{ key: "region", label: "REGION", value: regional[2] }],
  };
  return { membership, subtitle: role || null,
    additional: role ? [{ key: "role", label: "ROLE", value: role }] : [] };
}
