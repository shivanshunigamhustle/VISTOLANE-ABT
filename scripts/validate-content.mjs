#!/usr/bin/env node
/**
 * Loads and validates every content record, prints a per-record summary, and
 * exits non-zero if anything failed.
 *
 * The script walks the content directories itself only to discover which files
 * exist. Every actual read, parse and validation still goes through the loader,
 * so this checks the same code path the site does.
 */
import { readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { INTENT_SLUGS } from "../lib/content/intents.js";
import { getCountry, getProgram } from "../lib/content/loader.js";

const CONTENT_DIR = path.join(process.cwd(), "content");
const COUNTRIES_DIR = path.join(CONTENT_DIR, "countries");
const PROGRAMS_DIR = path.join(CONTENT_DIR, "programs");

const PASS = "✓";
const FAIL = "✗";

/** @type {string[]} */
const failures = [];
let checked = 0;

/**
 * @param {string} dir
 * @param {(entry: import("node:fs").Dirent) => boolean} predicate
 * @returns {Promise<string[]>}
 */
async function entries(dir, predicate) {
  try {
    const found = await readdir(dir, { withFileTypes: true });
    return found
      .filter(predicate)
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

/**
 * @param {string} label
 * @param {Error} error
 */
function report(label, error) {
  const detail = error.message
    .split("\n")
    .map((line) => `      ${line.trim()}`)
    .join("\n");
  console.log(`  ${FAIL} ${label}`);
  console.log(detail);
  failures.push(label);
}

console.log(
  `Validating content in ${path.relative(process.cwd(), CONTENT_DIR)}/\n`
);

console.log("Countries");
const countrySlugs = await entries(
  COUNTRIES_DIR,
  (entry) => entry.isFile() && entry.name.endsWith(".json")
).then((names) => names.map((name) => name.replace(/\.json$/, "")));

if (countrySlugs.length === 0) {
  console.log("  (none)");
}
for (const slug of countrySlugs) {
  checked += 1;
  try {
    const country = await getCountry(slug);
    if (!country) {
      throw new Error(`Loader returned null for a file that exists.`);
    }
    console.log(`  ${PASS} ${slug} — ${country.name}`);
  } catch (error) {
    report(slug, error);
  }
}

console.log("\nPrograms");
let programCount = 0;
for (const country of await entries(PROGRAMS_DIR, (entry) =>
  entry.isDirectory()
)) {
  for (const intent of await entries(
    path.join(PROGRAMS_DIR, country),
    (entry) => entry.isDirectory()
  )) {
    const label = `${country}/${intent}`;
    if (!INTENT_SLUGS.includes(intent)) {
      checked += 1;
      report(
        label,
        new Error(
          `Unknown intent directory "${intent}". Expected one of: ${INTENT_SLUGS.join(", ")}.`
        )
      );
      continue;
    }
    const slugs = await entries(
      path.join(PROGRAMS_DIR, country, intent),
      (entry) => entry.isFile() && entry.name.endsWith(".mdx")
    ).then((names) => names.map((name) => name.replace(/\.mdx$/, "")));

    for (const slug of slugs) {
      checked += 1;
      programCount += 1;
      try {
        const program = await getProgram(country, intent, slug);
        if (!program) {
          throw new Error(`Loader returned null for a file that exists.`);
        }
        console.log(`  ${PASS} ${country}/${intent}/${slug} — ${program.name}`);
      } catch (error) {
        report(`${country}/${intent}/${slug}`, error);
      }
    }
  }
}
if (programCount === 0 && failures.length === 0) {
  console.log("  (none)");
}

const valid = checked - failures.length;
console.log(
  `\n${checked} record${checked === 1 ? "" : "s"} checked · ${valid} valid · ${failures.length} invalid`
);

if (failures.length > 0) {
  console.error(`\nContent validation failed: ${failures.join(", ")}`);
  process.exit(1);
}
