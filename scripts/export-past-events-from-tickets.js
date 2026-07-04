const path = require("node:path");
const {
  buildPastEventsArchiveFromTickets,
  writePastEventsArchive,
} = require("./past-events-archive-exporter");

const DEFAULT_INPUT = path.resolve(__dirname, "..", "..", "BGSNL EVENTS", "all_tickets.tsv");
const DEFAULT_JSON_OUT = path.resolve(__dirname, "..", "src", "util", "defines", "past-events-archive.json");
const DEFAULT_JS_OUT = path.resolve(__dirname, "..", "src", "util", "defines", "PAST_EVENTS_ARCHIVE.js");

function argValue(argv, key) {
  const prefix = `${key}=`;
  const inline = argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = argv.indexOf(key);
  return index >= 0 ? argv[index + 1] : undefined;
}

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function main() {
  const argv = process.argv.slice(2);
  const inputPath = path.resolve(argValue(argv, "--input") || process.env.BGSNL_PAST_EVENTS_INPUT || DEFAULT_INPUT);
  const jsonOutPath = path.resolve(argValue(argv, "--json-out") || process.env.BGSNL_PAST_EVENTS_JSON_OUT || DEFAULT_JSON_OUT);
  const jsOutPath = path.resolve(argValue(argv, "--js-out") || process.env.BGSNL_PAST_EVENTS_JS_OUT || DEFAULT_JS_OUT);
  const limit = positiveInteger(argValue(argv, "--limit") || process.env.BGSNL_PAST_EVENTS_LIMIT, 120);

  const archive = buildPastEventsArchiveFromTickets({ inputPath, limit });
  const payload = writePastEventsArchive({ archive, jsonOutPath, jsOutPath });

  console.log(`Exported ${payload.stats.totalEvents} public past event summaries from ${inputPath}`);
  console.log(`Wrote ${jsonOutPath}`);
  console.log(`Wrote ${jsOutPath}`);
}

if (require.main === module) {
  main();
}
