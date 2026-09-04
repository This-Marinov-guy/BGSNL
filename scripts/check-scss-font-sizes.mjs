import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const PROJECT_ROOT = process.cwd();
const SCSS_ROOTS = ["public", "src"];
const MINIMUMS = {
  px: 16,
  rem: 1,
  em: 1,
  "%": 100,
};

const collectScssFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) return collectScssFiles(entryPath);
      return entry.isFile() && entry.name.endsWith(".scss") ? [entryPath] : [];
    }),
  );

  return files.flat();
};

const getLineNumber = (source, index) =>
  source.slice(0, index).split("\n").length;

const violations = [];

for (const root of SCSS_ROOTS) {
  const files = await collectScssFiles(path.join(PROJECT_ROOT, root));

  for (const file of files) {
    const source = await readFile(file, "utf8");
    const relativeFile = path.relative(PROJECT_ROOT, file);
    const declarationPattern = /font-size\s*:\s*([^;]+);/g;

    for (const match of source.matchAll(declarationPattern)) {
      const value = match[1].trim();
      const usesSmallToken =
        value.includes("$type-size-small") || value.includes("--type-small");
      const isApprovedSmallRule =
        relativeFile.endsWith("default/_typography.scss") && usesSmallToken;

      if (usesSmallToken && !isApprovedSmallRule) {
        violations.push({
          file: relativeFile,
          line: getLineNumber(source, match.index),
          value,
          reason: "the small token is reserved for <small> and .type-small",
        });
        continue;
      }

      if (isApprovedSmallRule) continue;

      const sizePattern = /(-?\d*\.?\d+)\s*(px|rem|em|%)/gi;
      for (const sizeMatch of value.matchAll(sizePattern)) {
        const amount = Number(sizeMatch[1]);
        const unit = sizeMatch[2].toLowerCase();

        if (amount < MINIMUMS[unit]) {
          violations.push({
            file: relativeFile,
            line: getLineNumber(source, match.index),
            value,
            reason: `minimum regular text size is 1rem (${MINIMUMS[unit]}${unit})`,
          });
          break;
        }
      }
    }
  }
}

if (violations.length) {
  console.error("SCSS font-size rule failed:\n");
  for (const violation of violations) {
    console.error(
      `- ${violation.file}:${violation.line} — ${violation.value} (${violation.reason})`,
    );
  }
  process.exit(1);
}

console.log("SCSS font-size rule passed: regular text is at least 1rem.");
