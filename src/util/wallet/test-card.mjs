export const TEST_CASES = ["member-active", "member-locked", "alumni-active", "alumni-locked"];

export function walletPreviewEnabled(env = process.env) {
  return env.NODE_ENV === "development";
}

export function getTestCard(id, spec) {
  if (!TEST_CASES.includes(id)) return null;
  const alumni = id.startsWith("alumni-");
  return {
    id,
    mocked: true,
    firstName: spec.previewData.firstName,
    surname: spec.previewData.surname,
    membershipLabel: alumni
      ? spec.memberFields.membershipLabel.alumniTemplate.replace("{alumniTier}", "II")
      : spec.memberFields.membershipLabel.memberTemplate.replace("{city}", spec.previewData.city),
    status: id.endsWith("-locked") ? "locked" : "active",
    profileImage: "/assets/images/avatars/bg_other_avatar_1.jpeg",
  };
}

export function testCardUrl(id, baseUrl) {
  if (!TEST_CASES.includes(id)) throw new Error("Unknown wallet test case");
  const base = new URL(baseUrl);
  if (!["http:", "https:"].includes(base.protocol) || base.username || base.password) {
    throw new Error("Wallet test URL must be an HTTP(S) URL without credentials");
  }
  return new URL(`/dev/wallet-card?card=${id}`, base.origin).href;
}

// Draft payloads only. No signing, Google API requests or pass issuance here.
export function buildPassDrafts(card, url, config = {}) {
  if (!card?.mocked || !TEST_CASES.includes(card.id)) throw new Error("Only mock cards are supported");
  if (!["active", "locked"].includes(card.status)) throw new Error("Invalid card status");
  const name = `${card.firstName} ${card.surname}`;
  const status = card.status === "active" ? "Active" : "Locked";
  const localized = (value) => ({ defaultValue: { language: "en", value } });
  const issuer = config.googleIssuerId || "ISSUER_ID_REQUIRED";
  return {
    apple: {
      formatVersion: 1,
      passTypeIdentifier: config.applePassTypeId || "PASS_TYPE_ID_REQUIRED",
      teamIdentifier: config.appleTeamId || "APPLE_TEAM_ID_REQUIRED",
      serialNumber: `bgsnl-test-v1-${card.id}`,
      organizationName: "Bulgarian Society Netherlands",
      description: "Bulgarian Society Netherlands membership — TEST ONLY",
      foregroundColor: "rgb(64, 99, 69)",
      backgroundColor: "rgb(213, 226, 215)",
      labelColor: "rgb(38, 38, 38)",
      voided: card.status === "locked",
      generic: {
        primaryFields: [{ key: "name", value: name, textAlignment: "PKTextAlignmentCenter" }],
        secondaryFields: [{ key: "membership", label: "MEMBERSHIP", value: card.membershipLabel, textAlignment: "PKTextAlignmentCenter" }],
        auxiliaryFields: [{ key: "status", label: "STATUS", value: status }],
        backFields: [{ key: "test", label: "Test pass", value: "Mock data only. Not proof of membership." }],
      },
      barcodes: [{ format: "PKBarcodeFormatQR", message: url, messageEncoding: "iso-8859-1" }],
    },
    google: {
      genericClasses: [{ id: `${issuer}.bgsnl_membership_test_v1` }],
      genericObjects: [{
        id: `${issuer}.bgsnl_test_v1_${card.id.replaceAll("-", "_")}`,
        classId: `${issuer}.bgsnl_membership_test_v1`,
        state: card.status === "active" ? "ACTIVE" : "INACTIVE",
        cardTitle: localized("BGSNL · TEST ONLY"),
        header: localized(name),
        subheader: localized(card.membershipLabel),
        hexBackgroundColor: "#D5E2D7",
        textModulesData: [{ id: "status", header: "Status", body: status }],
        barcode: { type: "QR_CODE", value: url },
      }],
    },
  };
}
