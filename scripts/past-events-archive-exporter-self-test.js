const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  buildPastEventsArchiveFromTickets,
  writePastEventsArchive,
} = require("./past-events-archive-exporter");

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "bgsnl-past-events-"));
const inputPath = path.join(tempDir, "all_tickets.tsv");
const jsonOutPath = path.join(tempDir, "past-events-archive.json");
const jsOutPath = path.join(tempDir, "PAST_EVENTS_ARCHIVE.js");

fs.writeFileSync(
  inputPath,
  [
    [
      "Status",
      "Type",
      "Timestamp",
      "Name",
      "Email",
      "Phone",
      "Preferences",
      "Ticket",
      "Name Event 1",
      "ID",
      "Status",
      "Region",
      "Name Event 2",
      "Date",
      "Location",
      "Ticket Timer",
      "Ticket Limit",
      "Price",
      "Member Price",
      "Active Member Price",
      "Ticket Link",
      "Created At",
    ].join("\t"),
    [
      "paid",
      "guest",
      "2024-04-01",
      "Private Person",
      "private@example.com",
      "+3112345678",
      "vegetarian",
      "VIP",
      "Spring Dinner",
      "evt-001",
      "active",
      "groningen",
      "Spring Dinner",
      "2024-05-24 18:30",
      "Groningen Forum",
      "2024-05-01",
      "80",
      "12",
      "10",
      "8",
      "bulgariansociety.nl/groningen/event-details/evt-001",
      "2024-03-10",
    ].join("\t"),
    [
      "paid",
      "guest",
      "2024-04-02",
      "Another Private Person",
      "another@example.com",
      "+3198765432",
      "none",
      "Regular",
      "Spring Dinner",
      "evt-001",
      "active",
      "groningen",
      "Spring Dinner",
      "2024-05-24 18:30",
      "Groningen Forum",
      "2024-05-01",
      "80",
      "12",
      "10",
      "8",
      "https://www.bulgariansociety.nl/groningen/event-details/evt-001",
      "2024-03-10",
    ].join("\t"),
    [
      "open",
      "guest",
      "2026-01-01",
      "Future Private",
      "future@example.com",
      "+3100000000",
      "none",
      "Regular",
      "Future Gala",
      "evt-999",
      "active",
      "amsterdam",
      "Future Gala",
      "2027-01-01 20:00",
      "Amsterdam",
      "2026-12-01",
      "100",
      "25",
      "20",
      "15",
      "https://www.bulgariansociety.nl/amsterdam/event-details/evt-999",
      "2026-01-01",
    ].join("\t"),
    [
      "paid",
      "guest",
      "2025-04-01",
      "Rotterdam Private Person",
      "rotterdam@example.com",
      "+3100000002",
      "none",
      "Regular",
      "Movie Night",
      "evt-bad",
      "active",
      "rotterdam",
      "Movie Night",
      "2025-04-05 18:00",
      "Polak Building",
      "2025-04-01",
      "80",
      "12",
      "10",
      "8",
      "https://www.bulgariansociety.nl/rotterdam/event-details/evt-bad",
      "2025-03-15",
    ].join("\t"),
    [
      "paid",
      "guest",
      "2024-04-03",
      "Breda Private Person",
      "breda@example.com",
      "+3100000001",
      "What menu would you like?: 2 kebapcheta & 1 meatball",
      "Regular",
      "Breda Dinner",
      "evt-002",
      "active",
      "Breda",
      "Breda Dinner",
      "2024-04-20 19:00",
      "Brandpunt Breda",
      "2024-04-01",
      "80",
      "12",
      "10",
      "8",
      "bulgariansociety.nl/breda/event-details/evt-002",
      "2024-03-15",
    ].join("\t"),
    [
      "paid",
      "guest",
      "2024-10-01",
      "Games Private Person",
      "games@example.com",
      "+3100000005",
      "none",
      "Regular",
      "Games night",
      "evt-003",
      "active",
      "Breda",
      "Games night",
      "4th Nov 2024 5:30 pm",
      "Buhne Breda",
      "4th Nov 2024 9:30 pm",
      "80",
      "12",
      "10",
      "8",
      "bulgariansociety.nl/breda/event-details/evt-003",
      "2024-09-20",
    ].join("\t"),
    [
      "paid",
      "guest",
      "",
      "Older Private Person",
      "older@example.com",
      "+3100000003",
      "Would you like to be in a specific team? : No What is the name of the team?:",
      "Regular",
      "Karaoke Night-4cabd",
      "evt-archive-only",
      "active",
      "Breda",
      "",
      "",
      "",
      "",
      "80",
      "12",
      "10",
      "8",
      "",
      "",
    ].join("\t"),
    [
      "paid",
      "guest",
      "2024-04-08",
      "Older Private Person 2",
      "older2@example.com",
      "+3100000004",
      "Would you like to be in a specific team? : Yes What is the name of the team?: Pour Decisions",
      "Regular",
      "Karaoke Night-4cabd",
      "evt-archive-only",
      "active",
      "Breda",
      "",
      "",
      "",
      "",
      "80",
      "12",
      "10",
      "8",
      "",
      "",
    ].join("\t"),
    [
      "paid",
      "guest",
      "2/1/2024",
      "Belot Private Person",
      "belot@example.com",
      "+3100000006",
      "none",
      "Teams 10 euro",
      "Belot Tournament",
      "evt-belot",
      "active",
      "Rotterdam",
      "",
      "",
      "",
      "",
      "80",
      "12",
      "10",
      "8",
      "",
      "",
    ].join("\t"),
    [
      "paid",
      "guest",
      "2/3/2024",
      "Solo Belot Private Person",
      "solo@example.com",
      "+3100000007",
      "none",
      "Single-player 6 euro",
      "Belot Tournament",
      "evt-belot",
      "active",
      "Rotterdam",
      "",
      "",
      "",
      "",
      "80",
      "12",
      "10",
      "8",
      "",
      "",
    ].join("\t"),
    [
      "paid",
      "guest",
      "",
      "Mystery Private Person",
      "mystery@example.com",
      "+3100000008",
      "none",
      "Regular",
      "Mystery Night-11111",
      "evt-mystery",
      "active",
      "Groningen",
      "",
      "",
      "",
      "",
      "80",
      "12",
      "10",
      "8",
      "",
      "",
    ].join("\t"),
  ].join("\n"),
  "utf8",
);

const archive = buildPastEventsArchiveFromTickets({
  inputPath,
  now: new Date("2026-07-04T00:00:00.000Z"),
});

assert.equal(archive.length, 6);

const springDinner = archive.find((event) => event.title === "Spring Dinner");
const bredaDinner = archive.find((event) => event.title === "Breda Dinner");
const gamesNight = archive.find((event) => event.id === "breda_tilburg-2024-11-04-games-night");
const karaokeNight = archive.find((event) => event.id === "breda_tilburg-2024-04-08-karaoke-night-4cabd");
const belotTournament = archive.find((event) => event.id === "rotterdam-2024-02-03-belot-tournament");
const mysteryNight = archive.find((event) => event.id === "groningen-archive-mystery-night-11111");

function withoutSummary(event) {
  const { summary, ...rest } = event;
  return rest;
}

assert.deepEqual(withoutSummary(springDinner), {
  id: "groningen-2024-05-24-spring-dinner",
  title: "Spring Dinner",
  region: "groningen",
  regionName: "Groningen",
  date: "2024-05-24",
  year: 2024,
  location: "Groningen Forum",
  registrationCount: 2,
  url: "",
  tags: ["culture", "social"],
});
assert.match(springDinner.summary, /shared meal|dinner|community/i);
assert.doesNotMatch(springDinner.summary, /as a completed community event/i);

assert.deepEqual(withoutSummary(bredaDinner), {
  id: "breda_tilburg-2024-04-20-breda-dinner",
  title: "Breda Dinner",
  region: "breda_tilburg",
  regionName: "Breda and Tilburg",
  date: "2024-04-20",
  year: 2024,
  location: "Brandpunt Breda",
  registrationCount: 1,
  url: "",
  tags: ["culture", "social"],
});
assert.match(bredaDinner.summary, /included menu choices/i);
assert.match(bredaDinner.summary, /kebapcheta/i);

assert.deepEqual(withoutSummary(gamesNight), {
  id: "breda_tilburg-2024-11-04-games-night",
  title: "Games night",
  region: "breda_tilburg",
  regionName: "Breda and Tilburg",
  date: "2024-11-04",
  year: 2024,
  location: "Buhne Breda",
  registrationCount: 1,
  url: "",
  tags: ["social"],
});
assert.match(gamesNight.summary, /game-night|game night|play/i);

assert.deepEqual(withoutSummary(karaokeNight), {
  id: "breda_tilburg-2024-04-08-karaoke-night-4cabd",
  title: "Karaoke Night",
  region: "breda_tilburg",
  regionName: "Breda and Tilburg",
  date: "2024-04-08",
  dateSource: "last-ticket-purchase",
  year: 2024,
  location: "",
  registrationCount: 2,
  url: "",
  tags: ["social"],
  sourceStatus: "archive-recovered",
});
assert.match(karaokeNight.summary, /team sign-ups|music|social/i);

assert.deepEqual(withoutSummary(belotTournament), {
  id: "rotterdam-2024-02-03-belot-tournament",
  title: "Belot Tournament",
  region: "rotterdam",
  regionName: "Rotterdam",
  date: "2024-02-03",
  dateSource: "last-ticket-purchase",
  year: 2024,
  location: "",
  registrationCount: 2,
  url: "",
  tags: ["social", "sports"],
  sourceStatus: "archive-recovered",
});
assert.match(belotTournament.summary, /team and single-player sign-ups/i);

assert.deepEqual(withoutSummary(mysteryNight), {
  id: "groningen-archive-mystery-night-11111",
  title: "Mystery Night",
  region: "groningen",
  regionName: "Groningen",
  date: "",
  year: null,
  location: "",
  registrationCount: 1,
  url: "",
  tags: [],
  sourceStatus: "archive-only",
});
assert.match(mysteryNight.summary, /Groningen/);

assert.equal(
  archive.some((event) => event.id === "rotterdam-2025-04-05-movie-night"),
  false,
  "bad Rotterdam 2025 Movie Night archive entry should be excluded",
);

writePastEventsArchive({
  archive,
  jsonOutPath,
  jsOutPath,
  generatedAt: "2026-07-04T00:00:00.000Z",
});

const jsonOutput = fs.readFileSync(jsonOutPath, "utf8");
const jsOutput = fs.readFileSync(jsOutPath, "utf8");
const parsedJsonOutput = JSON.parse(jsonOutput);
assert.equal(parsedJsonOutput.stats.totalRegistrations, 9);
assert.match(jsonOutput, /Spring Dinner/);
assert.match(jsonOutput, /Breda Dinner/);
assert.match(jsonOutput, /Games night/);
assert.match(jsonOutput, /Karaoke Night/);
assert.match(jsonOutput, /Belot Tournament/);
assert.match(jsonOutput, /included menu choices/i);
assert.match(jsonOutput, /team and single-player sign-ups/i);
assert.doesNotMatch(jsonOutput, /Earlier archive|Venue not listed|dateLabel/);
assert.doesNotMatch(jsonOutput, /event-details/);
assert.doesNotMatch(jsonOutput, /rotterdam-2025-04-05-movie-night/);
assert.doesNotMatch(jsonOutput, /as a completed community event/);
assert.match(jsOutput, /PAST_EVENTS_ARCHIVE/);
assert.doesNotMatch(jsonOutput, /private@example\.com|Another Private Person|breda@example\.com|belot@example\.com|solo@example\.com|\+3112345678|Ticket Limit|Price|bgsg-guest-tickets|bgsg-member-tickets/);
assert.doesNotMatch(jsOutput, /private@example\.com|Another Private Person|breda@example\.com|belot@example\.com|solo@example\.com|\+3112345678|Ticket Limit|Price|bgsg-guest-tickets|bgsg-member-tickets/);

console.log("Past events archive exporter self-test passed");
