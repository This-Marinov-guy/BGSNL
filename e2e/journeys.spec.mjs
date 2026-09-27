import { test, expect } from "@playwright/test";
import { accounts, completeStripeCheckout, completeStripePortalChange, dismissCookies, fillIdentity, logIn, promoteActiveMember, promoteBackofficeAdmin, runId, setPhone, testImage, testPdf } from "./helpers.mjs";

test.describe.configure({ mode: "serial" });

const eventTitle = `BGSNL flow test ${runId}-${Date.now().toString(36)}`;
let publicEventUrl;

async function joinAsMember(page, account) {
  await page.goto("/groningen/signup");
  await page.getByRole("button", { name: /6-months Member/ }).click();
  await expect(page.getByRole("heading", { name: "Complete your membership" })).toBeVisible();
  await fillIdentity(page, account);
  await page.locator('input[name="birth"]').fill("15/01/2000");
  await page.locator('input[name="birth"]').press("Tab");
  await page.locator('input[name="isWorking"]').check();
  await page.locator('input[name="profession"]').fill("UI flow tester");
  for (const consent of ["policyTerms", "dataTerms", "payTerms"]) {
    await page.locator(`input[name="${consent}"]`).check();
  }
  await page.getByRole("button", { name: "Continue to payment" }).click();
  await completeStripeCheckout(page);
  await expect(page.getByText("Your account and membership card are ready.")).toBeVisible({ timeout: 90_000 });
}

async function joinAsAlumni(page) {
  await page.goto("/alumni/register");
  await page.getByRole("button", { name: /Tier II\b/ }).click();
  await expect(page.getByRole("heading", { name: "Complete your alumni profile" })).toBeVisible();
  await fillIdentity(page, accounts.alumni);
  await page.locator('input[name="policyTerms"]').check();
  await page.getByRole("button", { name: "Continue to payment" }).click();
  await completeStripeCheckout(page);
  await expect(page.getByText("Your account and membership card are ready.")).toBeVisible({ timeout: 90_000 });
}

async function fillDate(page, placeholder, date) {
  const input = page.locator(`input[placeholder="${placeholder}"]:visible`);
  await input.click();
  const calendar = page.getByRole("dialog");
  const targetMonth = date.toLocaleString("en", { month: "long" });
  for (let step = 0; step < 15; step++) {
    const month = await calendar.getByRole("button", { name: "Choose Month" }).textContent();
    const year = await calendar.getByRole("button", { name: "Choose Year" }).textContent();
    if (month === targetMonth && Number(year) === date.getFullYear()) break;
    await calendar.getByRole("button", { name: "Next month" }).click();
  }
  const timestamp = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  await calendar.locator(`[data-part="day"][data-timestamp="${timestamp}"]`).click();
  await expect(input).not.toHaveValue("");
}

test("create a Member account through signup and Stripe Checkout", async ({ page }) => {
  if (!process.env.E2E_REUSE_RUN_ID) await joinAsMember(page, accounts.member);
  await logIn(page, accounts.member);
});

test("create an Alumni account through signup and Stripe Checkout", async ({ page }) => {
  if (!process.env.E2E_REUSE_RUN_ID) await joinAsAlumni(page);
  await logIn(page, accounts.alumni);
});

test("create an active Member and assign the event creator role", async ({ page }) => {
  if (!process.env.E2E_REUSE_RUN_ID) {
    await joinAsMember(page, accounts.active);
    await promoteActiveMember(accounts.active.email);
  }
  await logIn(page, accounts.active);
  await page.goto("/user/dashboard/events/create");
  await expect(page.getByRole("heading", { name: "Create an event" })).toBeVisible();
});

test("publish an event using the event creation UI", async ({ page, context }) => {
  test.setTimeout(300_000);
  await logIn(page, accounts.active);
  await page.goto("/user/dashboard/events/create");
  const region = page.getByRole("combobox", { name: "region" });
  if (await region.isEnabled()) {
    await region.click();
    await page.getByRole("option", { name: "Groningen" }).click();
  } else {
    await expect(region).toHaveText("Groningen");
  }
  await page.locator('input[name="location"]').fill("BGSNL test venue, Groningen");
  await page.locator('input[name="title"]').fill(eventTitle);
  await page.locator('textarea[name="text"]').fill("Automated end-to-end event for checking signup, ticket purchase, and event management through the UI.");
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + 45);
  await fillDate(page, "Select event date and time", eventDate);
  await page.getByRole("button", { name: "Save & continue" }).click();
  await expect(page.getByRole("heading", { name: "Tickets & media" })).toBeVisible();

  await page.locator('input[name="guestPrice"]:visible').fill("12");
  await page.locator('input[name="memberPrice"]:visible').fill("8");
  await page.locator('input[name="activeMemberPrice"]:visible').fill("6");
  const images = page.getByRole("region", { name: "Event images" });
  await images.locator('input[name="poster"]').setInputFiles(await testImage(900, 1200));
  await images.locator('input[name="ticketImg"]').setInputFiles(await testImage(1500, 485));
  await page.locator('input[name="ticketLimit"]:visible').fill("30");
  const salesDate = new Date(eventDate);
  salesDate.setDate(salesDate.getDate() - 1);
  await fillDate(page, "Select ticket sales deadline", salesDate);
  await page.getByRole("button", { name: "Save & continue" }).click();
  await expect(page.getByRole("heading", { name: "Upsell" })).toBeVisible();
  await page.getByRole("button", { name: "Submit event" }).click();
  const review = page.getByRole("dialog");
  await expect(review.getByRole("heading", { name: eventTitle })).toBeVisible();
  await review.getByRole("button", { name: "Submit event" }).click();

  await expect(page).toHaveURL(/\/user\/dashboard\/events(?:[?#]|$)/, { timeout: 90_000 });
  await page.getByRole("button", { name: `Open ${eventTitle}` }).last().click();
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("group", { name: "Event actions" }).getByRole("button", { name: "Link" }).click();
  publicEventUrl = await page.evaluate(() => navigator.clipboard.readText());
  expect(publicEventUrl).toMatch(/\/groningen\/event-details\//);
  await page.goto(publicEventUrl);
  if (await page.getByRole("heading", { name: "Something went wrong." }).isVisible()) {
    await page.getByRole("button", { name: "Try again" }).click();
  }
  await expect(page.getByRole("heading", { name: eventTitle })).toBeVisible();
});

test("edit the published event in the back office", async ({ page }) => {
  const updatedVenue = `BGSNL updated venue ${runId}`;
  await logIn(page, accounts.active);
  await page.goto("/user/dashboard/events");
  await page.getByRole("button", { name: `Open ${eventTitle}` }).last().click();
  await page.getByRole("group", { name: "Event actions" }).getByRole("button", { name: "Edit" }).click();
  await expect(page.getByRole("heading", { name: "Edit Event" })).toBeVisible();
  await page.locator('input[name="location"]').fill(updatedVenue);
  await page.getByRole("button", { name: "Save and exit" }).click();
  await expect(page).toHaveURL(/\/user\/dashboard\/events(?:[?#]|$)/);
  await page.getByRole("button", { name: `Open ${eventTitle}` }).last().click();
  await expect(page.getByRole("dialog").getByText(updatedVenue, { exact: true })).toBeVisible();
  await page.goto(publicEventUrl);
  await expect(page.getByText(updatedVenue, { exact: true })).toBeVisible();
});

for (const actor of ["guest", "member", "alumni", "active"]) {
  test(`buy a ticket as ${actor} through the UI`, async ({ page }) => {
    expect(publicEventUrl, "Event creation must finish before ticket tests").toBeTruthy();
    if (actor !== "guest") await logIn(page, accounts[actor]);
    await page.goto(publicEventUrl.replace("/event-details/", "/purchase-ticket/"));
    await dismissCookies(page);
    await expect(page.getByRole("heading", { name: "Complete your booking" })).toBeVisible();
    const guestFields = page.locator('input[name="name"]');
    if (await guestFields.isVisible()) {
      await guestFields.fill("Flow");
      await page.locator('input[name="surname"]').fill("Tester");
      await page.locator('input[name="email"]').fill(actor === "guest" ? `e2e-guest-${runId}@flow-test.bgsnl.local` : accounts[actor].email);
      await page.locator('input[name="policyTerms"]').check();
      await page.locator('input[name="payTerms"]').check();
      await setPhone(page);
      await page.locator('input[name="phone"]').press("Tab");
    }
    await page.getByRole("button", { name: "Proceed to payment" }).click();
    await expect.poll(() => page.url()).toMatch(/\/payment\/event-ticket\/|checkout\.stripe\.com/);
    if (page.url().includes("/payment/event-ticket/")) {
      await page.getByRole("button", { name: "Continue to payment" }).click();
    }
    await completeStripeCheckout(page, { email: actor === "guest" ? `e2e-guest-${runId}@flow-test.bgsnl.local` : accounts[actor].email });
    await expect(page.getByRole("heading", { name: "Your confirmation" })).toBeVisible();
  });
}

for (const actor of ["guest", "member", "alumni", "active"]) {
  test(`apply for an internship as ${actor}`, async ({ page }) => {
    if (actor !== "guest") await logIn(page, accounts[actor]);
    await page.goto("/internships");
    await dismissCookies(page);
    if (actor !== "guest") await expect(page.getByRole("button", { name: "Open account menu" })).toBeVisible();
    const apply = page.getByRole("button", { name: "Apply for Internship" }).first();
    await expect(apply, "The dev database needs an internship with on-site applications enabled").toBeVisible();
    await apply.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    if (actor === "guest") {
      await expect(dialog.getByText(/Only BGSNL members can apply/i)).toBeVisible();
      return;
    }
    await expect(dialog.getByRole("heading", { name: /Apply for / })).toBeVisible();
    await dialog.locator('input[name="cv"]').setInputFiles(testPdf());
    for (let attempt = 0; attempt < 2; attempt++) {
      const submitted = page.waitForResponse((response) => response.url().includes("/api/internship/member-apply") && response.request().method() === "POST");
      await dialog.getByRole("button", { name: "Apply for Internship" }).click();
      const response = await submitted;
      if (response.ok()) break;
      if (response.status() !== 503 || attempt === 1) throw new Error(`Internship application failed (HTTP ${response.status()}).`);
    }
    await expect(page.getByText("Application submitted successfully!")).toBeVisible({ timeout: 60_000 });
  });
}

for (const actor of ["guest", "member", "alumni", "active"]) {
  test(`submit a support ticket as ${actor}`, async ({ page }) => {
    if (actor !== "guest") await logIn(page, accounts[actor]);
    await page.goto("/contact");
    await dismissCookies(page);
    if (actor !== "guest") await expect(page.getByRole("button", { name: "Open account menu" })).toBeVisible();
    const profile = actor === "guest" ? null : page.waitForResponse((response) => response.url().includes("/api/support/profile") && response.ok());
    await page.getByRole("button", { name: "Report a website problem" }).first().click();
    if (profile) await profile;
    const support = page.getByRole("dialog", { name: "Website support" });
    await support.getByRole("button", { name: /New report|Report a website problem|Report a problem/ }).first().click();
    await expect(support.getByLabel("What isn’t working?")).toBeVisible();
    if (actor === "guest") {
      await support.getByLabel("Your name").fill("Flow Tester");
      await support.getByLabel("Email address").fill(`e2e-support-${runId}@flow-test.bgsnl.local`);
    }
    const subject = `Flow test support ${actor} ${runId}`;
    await support.getByLabel("What isn’t working?").fill(subject);
    await support.getByLabel("What happened?").fill("This is an automated UI journey report from the local development test run.");
    await support.getByRole("button", { name: "Send report" }).click();
    await expect(support.getByText(subject)).toBeVisible({ timeout: 60_000 });
  });
}

async function findAccount(page, type, email) {
  await page.goto("/user/dashboard/members");
  await expect(page.getByRole("heading", { name: "Accounts dashboard" })).toBeVisible();
  await page.getByLabel("Show").selectOption(type);
  await page.getByLabel("Search").fill(email);
  const directory = page.getByRole("region", { name: `${type} directory` });
  const row = directory.getByRole("row").filter({ hasText: email }).first();
  await expect(row).toBeVisible();
  return row;
}

async function openAccount(page, type, email) {
  const row = await findAccount(page, type, email);
  await row.getByRole("button", { name: "Edit Flow Tester" }).click();
  const editor = page.getByRole("dialog", { name: "Flow Tester" });
  await expect(editor).toBeVisible();
  return editor;
}

test("update Member profile and role in the back office", async ({ page }) => {
  await promoteBackofficeAdmin(accounts.active.email);
  await logIn(page, accounts.active);
  const editor = await openAccount(page, "member", accounts.member.email);
  const profession = `Back office tester ${runId}`;
  await editor.getByLabel("Profession").fill(profession);
  await editor.locator('[aria-label="Account roles"]').getByRole("checkbox", { name: "Active member" }).check();
  await editor.getByRole("button", { name: "Save changes" }).click();
  await expect(editor).toBeHidden();
  const saved = await openAccount(page, "member", accounts.member.email);
  await expect(saved.getByLabel("Profession")).toHaveValue(profession);
  await expect(saved.locator('[aria-label="Account roles"]').getByRole("checkbox", { name: "Active member" })).toBeChecked();
});

test("update Alumni profile in the back office", async ({ page }) => {
  await logIn(page, accounts.active);
  const editor = await openAccount(page, "alumni", accounts.alumni.email);
  const profession = `Alumni flow tester ${runId}`;
  await editor.getByLabel("Profession").fill(profession);
  await editor.getByRole("button", { name: "Save changes" }).click();
  await expect(editor).toBeHidden();
  const saved = await openAccount(page, "alumni", accounts.alumni.email);
  await expect(saved.getByLabel("Profession")).toHaveValue(profession);
});

for (const [source, target, planLabel] of [
  ["member", "alumni", /Tier 2\b/],
  ["alumni", "member", /6.month/i],
]) {
  test(`transfer a ${source} account to ${target} through the back office and owner UI`, async ({ page }) => {
    test.setTimeout(300_000);
    if (process.env.E2E_SKIP_TRANSFER_REQUEST !== "1") {
      await logIn(page, accounts.active);
      const editor = await openAccount(page, source, accounts[source].email);
      const membership = editor.getByRole("region", { name: "Membership management" });
      await membership.getByRole("button", { name: "Send transfer link" }).click();
      await membership.getByRole("button", { name: `Request transfer to ${target === "alumni" ? "Alumni" : "Member"}` }).click();
      await expect(membership.getByText("Transfer email queued. The account changes after its owner confirms the new plan.")).toBeVisible();
    }

    await logIn(page, accounts[source]);
    await page.goto(`/user?transferTo=${target}#settings`);
    const transfer = page.getByRole("dialog", { name: `Transfer to ${target === "alumni" ? "Alumni" : "Member"}` });
    await expect(transfer).toBeVisible({ timeout: 90_000 });
    await expect(transfer.getByText(accounts[source].email)).toBeVisible();
    const plan = transfer.getByLabel(target === "alumni" ? "Alumni tier" : "Membership period");
    await plan.click();
    await page.getByRole("option", { name: planLabel }).click();
    const continueToPayment = transfer.getByRole("button", { name: "Continue to payment" });
    await expect(continueToPayment).toBeEnabled({ timeout: 20_000 });
    await continueToPayment.click();
    await completeStripePortalChange(page);

    const adminPage = await page.context().newPage();
    await logIn(adminPage, accounts.active);
    const migrated = await findAccount(adminPage, target, accounts[source].email);
    await expect(migrated).toBeVisible();
    await adminPage.getByLabel("Show").selectOption(source);
    await expect(adminPage.getByRole("row").filter({ hasText: accounts[source].email })).toHaveCount(0);
  });
}
