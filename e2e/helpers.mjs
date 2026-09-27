import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { expect } from "@playwright/test";
import sharp from "sharp";

const exec = promisify(execFile);
export const runId = process.env.E2E_REUSE_RUN_ID || process.env.E2E_RUN_ID || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
export const password = `FlowTest-${runId}-A1!`;
export const accounts = {
  member: { email: `e2e-member-${runId}@flow-test.bgsnl.local`, password },
  alumni: { email: `e2e-alumni-${runId}@flow-test.bgsnl.local`, password },
  active: { email: `e2e-active-${runId}@flow-test.bgsnl.local`, password },
};

export async function dismissCookies(page) {
  const mandatory = page.getByRole("button", { name: "Mandatory", exact: true });
  if (await mandatory.isVisible()) await mandatory.click();
}

export async function logIn(page, account) {
  await page.context().clearCookies();
  await page.setExtraHTTPHeaders({ "x-bgsnl-e2e-client-ip": `127.200.${1 + Math.floor(Math.random() * 254)}.${1 + Math.floor(Math.random() * 254)}` });
  await page.goto("/login");
  await dismissCookies(page);
  await page.locator("#login-email").fill(account.email);
  await page.locator("#login-password").fill(account.password);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page).toHaveURL(/\/user(?:[?#]|$)/, { timeout: 60_000 });
  await page.setExtraHTTPHeaders({});
}

export async function setPhone(page) {
  const phone = page.locator('input[name="phone"]');
  await phone.click();
  await phone.pressSequentially("612345678");
  await expect(phone).toHaveValue("612345678");
}

export async function completeStripeCheckout(page, { email } = {}) {
  await expect(page).toHaveURL(/checkout\.stripe\.com/, { timeout: 60_000 });
  await page.getByRole("radio", { name: "Card" }).check({ force: true });
  const checkoutEmail = page.getByRole("textbox", { name: "Email", exact: true });
  if (email && await checkoutEmail.isVisible() && !await checkoutEmail.inputValue()) await checkoutEmail.fill(email);
  const card = page.locator('input[name="cardNumber"]');
  await expect(card).toBeVisible({ timeout: 40_000 });
  await card.fill("4242424242424242");
  await page.locator('input[name="cardExpiry"]').fill("1230");
  await page.locator('input[name="cardCvc"]').fill("123");
  const name = page.locator('input[name="billingName"]');
  if (await name.isVisible()) await name.fill("BGSNL Flow Test");
  const postal = page.locator('input[name="billingPostalCode"]');
  if (await postal.isVisible()) await postal.fill("9711AA");
  await page.getByRole("button", { name: /Pay|Subscribe|Start trial/i }).last().click();
  await expect(page.getByRole("heading", { name: /Payment received|You’re all set/i })).toBeVisible({ timeout: 120_000 });
}

export async function completeStripePortalChange(page) {
  await expect(page).toHaveURL(/billing\.stripe\.com/, { timeout: 60_000 });
  const confirm = page.getByRole("button", { name: /^(?:Subscribe and pay|Confirm and pay)/ });
  await expect(confirm).toBeVisible({ timeout: 60_000 });
  if (!/Confirming/.test(await confirm.textContent())) await confirm.click();
  await expect(page).toHaveURL(/localhost:3000\/user/, { timeout: 120_000 });
}

export async function fillIdentity(page, account) {
  await page.locator('input[name="name"]').fill("Flow");
  await page.locator('input[name="surname"]').fill("Tester");
  await setPhone(page);
  await page.locator('input[name="email"]').fill(account.email);
  await page.locator('input[name="password"]').fill(account.password);
  await page.locator('input[name="confirmPassword"]').fill(account.password);
}

export async function promoteActiveMember(email) {
  await exec(process.execPath, ["scripts/provision-e2e-active-member.mjs", email], {
    cwd: fileURLToPath(new URL("../../BGSNL-API/", import.meta.url)),
    env: { ...process.env, APP_ENV: "dev" },
    timeout: 30_000,
  });
}

export async function promoteBackofficeAdmin(email) {
  await exec(process.execPath, ["scripts/provision-e2e-active-member.mjs", email, "admin"], {
    cwd: fileURLToPath(new URL("../../BGSNL-API/", import.meta.url)),
    env: { ...process.env, APP_ENV: "dev" },
    timeout: 30_000,
  });
}

export async function testImage(width, height) {
  return {
    name: `flow-test-${width}x${height}.png`,
    mimeType: "image/png",
    buffer: await sharp({ create: { width, height, channels: 3, background: "#168679" } }).png().toBuffer(),
  };
}

export function testPdf() {
  const content = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF";
  return { name: "bgsnl-flow-test-cv.pdf", mimeType: "application/pdf", buffer: Buffer.from(content) };
}
