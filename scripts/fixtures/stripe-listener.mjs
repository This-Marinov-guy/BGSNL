// Test-only CLI stand-in: no Stripe/network access or real credentials.
process.stderr.write("> Ready! Your webhook signing secret is whsec_");
setTimeout(() => process.stderr.write("fixture (^C to quit)\n"), 20);
setInterval(() => {}, 1000);
process.on("SIGTERM", () => process.exit(0));
