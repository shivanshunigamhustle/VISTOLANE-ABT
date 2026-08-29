import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

import { getIntent as lookUpIntent, INTENT_SLUGS } from "./intents.js";
import {
  countrySchema,
  glossarySchema,
  guideSchema,
  newsUpdateSchema,
  parseOrThrow,
  programSchema,
} from "./schema.js";

/**
 * THE ADAPTER.
 *
 * Every read of country or program content goes through this file. No page,
 * route, or component may import from content/ or touch the filesystem — if
 * something appears to need that, it needs a function here instead.
 *
 * Every exported function is async even though the reads underneath could be
 * synchronous. That is deliberate: a CMS is async, and if the call sites already
 * await, swapping the internals here later changes nothing outside this file.
 * Do not "simplify" these to synchronous functions.
 *
 * Failure modes are split on purpose:
 *   • nothing there        → null, so a route can call notFound()
 *   • there but invalid    → throw, naming the file and the field
 * A bad record is never silently skipped.
 */

const CONTENT_DIR = path.join(process.cwd(), "content");
const COUNTRIES_DIR = path.join(CONTENT_DIR, "countries");
const PROGRAMS_DIR = path.join(CONTENT_DIR, "programs");
const GLOSSARY_DIR = path.join(CONTENT_DIR, "glossary");
const GUIDES_DIR = path.join(CONTENT_DIR, "guides");
const NEWS_DIR = path.join(CONTENT_DIR, "news");

/**
 * Parsed records, keyed by "kind:identifier". A build renders many routes from
 * the same handful of files; without this each route would re-read and
 * re-validate them.
 *
 * @type {Map<string, unknown>}
 */
const cache = new Map();

/**
 * The cache is a build-time optimisation only. In development it would mean an
 * edit to a content file did not appear until the server restarted, so outside
 * production every read goes back to disk.
 */
const CACHE_ENABLED = process.env.NODE_ENV === "production";

/**
 * @param {string} key
 * @returns {unknown} The cached record, or undefined when absent or bypassed.
 */
function cached(key) {
  return CACHE_ENABLED ? cache.get(key) : undefined;
}

/**
 * @template T
 * @param {string} key
 * @param {T} value
 * @returns {T} The value, so callers can `return remember(key, record)`.
 */
function remember(key, value) {
  if (CACHE_ENABLED) cache.set(key, value);
  return value;
}

/**
 * Path as written in the repo, for error messages.
 *
 * @param {string} absolutePath
 * @returns {string}
 */
function rel(absolutePath) {
  return path.relative(process.cwd(), absolutePath);
}

/**
 * @param {unknown} error
 * @returns {boolean}
 */
function isMissing(error) {
  return (
    Boolean(error) && /** @type {{ code?: string }} */ (error).code === "ENOENT"
  );
}

/**
 * Freeze a record and everything under it, so a cached object handed to two
 * routes cannot be mutated by one of them.
 *
 * @template T
 * @param {T} value
 * @returns {T}
 */
function deepFreeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  for (const key of Object.keys(value)) {
    deepFreeze(/** @type {Record<string, unknown>} */ (value)[key]);
  }
  return Object.freeze(value);
}

/**
 * Names (without extension) of the files in a directory, sorted. A directory
 * that does not exist yet reads as empty — that is a content state, not a fault.
 *
 * @param {string} dir
 * @param {string} extension  Including the leading dot.
 * @returns {Promise<string[]>}
 */
async function listFiles(dir, extension) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
      .map((entry) => entry.name.slice(0, -extension.length))
      .sort();
  } catch (error) {
    if (isMissing(error)) return [];
    throw error;
  }
}

/**
 * Names of the subdirectories of a directory, sorted.
 *
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function listDirs(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    if (isMissing(error)) return [];
    throw error;
  }
}

/**
 * Read, validate and cache one country file.
 *
 * @param {string} slug
 * @returns {Promise<import("./schema.js").Country | null>}
 */
async function loadCountry(slug) {
  const key = `country:${slug}`;
  const hit = /** @type {import("./schema.js").Country | undefined} */ (
    cached(key)
  );
  if (hit) return hit;

  const file = path.join(COUNTRIES_DIR, `${slug}.json`);
  let raw;
  try {
    raw = await readFile(file, "utf8");
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `Invalid JSON in ${rel(file)}: ${/** @type {Error} */ (error).message}`
    );
  }

  const country = parseOrThrow(countrySchema, data, rel(file));

  if (country.slug !== slug) {
    throw new Error(
      `Slug mismatch in ${rel(file)}: frontmatter says "${country.slug}" but the filename says "${slug}".`
    );
  }

  return remember(key, deepFreeze(country));
}

/**
 * Read, validate and cache one program file.
 *
 * @param {string} country
 * @param {string} intent
 * @param {string} slug
 * @returns {Promise<import("./schema.js").Program | null>}
 */
async function loadProgram(country, intent, slug) {
  const key = `program:${country}/${intent}/${slug}`;
  const hit = /** @type {import("./schema.js").Program | undefined} */ (
    cached(key)
  );
  if (hit) return hit;

  const file = path.join(PROGRAMS_DIR, country, intent, `${slug}.mdx`);
  let raw;
  try {
    raw = await readFile(file, "utf8");
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }

  let parsed;
  try {
    parsed = matter(raw);
  } catch (error) {
    throw new Error(
      `Unreadable frontmatter in ${rel(file)}: ${/** @type {Error} */ (error).message}`
    );
  }

  const frontmatter = parseOrThrow(programSchema, parsed.data, rel(file));

  // The directory layout encodes country and intent, and the filename encodes
  // the slug. If the frontmatter disagrees, one of the two is wrong and the
  // resulting URL would not be the one the author intended.
  const mismatches = [
    ["countrySlug", frontmatter.countrySlug, country],
    ["intent", frontmatter.intent, intent],
    ["slug", frontmatter.slug, slug],
  ].filter(([, declared, fromPath]) => declared !== fromPath);

  if (mismatches.length > 0) {
    const detail = mismatches
      .map(
        ([field, declared, fromPath]) =>
          `  • ${field}: frontmatter says "${declared}", path says "${fromPath}"`
      )
      .join("\n");
    throw new Error(`Path and frontmatter disagree in ${rel(file)}\n${detail}`);
  }

  return remember(key, deepFreeze({ ...frontmatter, body: parsed.content }));
}

/**
 * Every program file on disk, as { country, intent, slug } coordinates.
 *
 * @returns {Promise<Array<{ country: string, intent: string, slug: string }>>}
 */
async function programIndex() {
  const key = "index:programs";
  const hit =
    /** @type {Array<{ country: string, intent: string, slug: string }> | undefined} */ (
      cached(key)
    );
  if (hit) return hit;

  /** @type {Array<{ country: string, intent: string, slug: string }>} */
  const entries = [];

  for (const country of await listDirs(PROGRAMS_DIR)) {
    for (const intent of await listDirs(path.join(PROGRAMS_DIR, country))) {
      if (!INTENT_SLUGS.includes(/** @type {never} */ (intent))) {
        throw new Error(
          `Unknown intent directory ${rel(path.join(PROGRAMS_DIR, country, intent))}. ` +
            `Expected one of: ${INTENT_SLUGS.join(", ")}.`
        );
      }
      const dir = path.join(PROGRAMS_DIR, country, intent);
      for (const slug of await listFiles(dir, ".mdx")) {
        entries.push({ country, intent, slug });
      }
    }
  }

  return remember(key, deepFreeze(entries));
}

/**
 * Every country, sorted by name.
 *
 * @returns {Promise<import("./schema.js").Country[]>}
 */
export async function getAllCountries() {
  const slugs = await listFiles(COUNTRIES_DIR, ".json");
  const countries = [];
  for (const slug of slugs) {
    const country = await loadCountry(slug);
    if (country) countries.push(country);
  }
  return countries.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * One country.
 *
 * @param {string} slug
 * @returns {Promise<import("./schema.js").Country | null>} null when there is no
 *   such country, so the route can call notFound().
 */
export async function getCountry(slug) {
  if (!slug) return null;
  return loadCountry(slug);
}

/**
 * Every program, ordered by country, then by intent in INTENTS order, then by name.
 *
 * @returns {Promise<import("./schema.js").Program[]>}
 */
export async function getAllPrograms() {
  const entries = await programIndex();
  const programs = [];
  for (const entry of entries) {
    const program = await loadProgram(entry.country, entry.intent, entry.slug);
    if (program) programs.push(program);
  }
  return programs.sort(
    (a, b) =>
      a.countrySlug.localeCompare(b.countrySlug) ||
      INTENT_SLUGS.indexOf(a.intent) - INTENT_SLUGS.indexOf(b.intent) ||
      a.name.localeCompare(b.name)
  );
}

/**
 * Programs narrowed by country, by intent, or by both. Omitting a filter leaves
 * that dimension open.
 *
 * @param {{ country?: string, intent?: string }} [filters]
 * @returns {Promise<import("./schema.js").Program[]>}
 */
export async function getPrograms(filters = {}) {
  const { country, intent } = filters;
  const programs = await getAllPrograms();
  return programs.filter(
    (program) =>
      (country === undefined || program.countrySlug === country) &&
      (intent === undefined || program.intent === intent)
  );
}

/**
 * One program, addressed the way its URL addresses it.
 *
 * @param {string} country
 * @param {string} intent
 * @param {string} slug
 * @returns {Promise<import("./schema.js").Program | null>} null when there is no
 *   such program, so the route can call notFound().
 */
export async function getProgram(country, intent, slug) {
  if (!country || !intent || !slug) return null;
  return loadProgram(country, intent, slug);
}

/**
 * One intent. Re-exported from intents.js, wrapped as async so that every call
 * site of this module awaits — if intents ever move behind the CMS too, nothing
 * outside this file changes.
 *
 * @param {string} slug
 * @returns {Promise<import("./intents.js").Intent | null>}
 */
export async function getIntent(slug) {
  return lookUpIntent(slug);
}

/**
 * Read, validate and cache one glossary term.
 *
 * @param {string} slug
 * @returns {Promise<import("./schema.js").GlossaryTerm | null>}
 */
async function loadTerm(slug) {
  const key = `term:${slug}`;
  const hit = /** @type {import("./schema.js").GlossaryTerm | undefined} */ (
    cached(key)
  );
  if (hit) return hit;

  const file = path.join(GLOSSARY_DIR, `${slug}.json`);
  let raw;
  try {
    raw = await readFile(file, "utf8");
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `Invalid JSON in ${rel(file)}: ${/** @type {Error} */ (error).message}`
    );
  }

  const term = parseOrThrow(glossarySchema, data, rel(file));

  if (term.slug !== slug) {
    throw new Error(
      `Slug mismatch in ${rel(file)}: record says "${term.slug}" but the filename says "${slug}".`
    );
  }

  return remember(key, deepFreeze(term));
}

/**
 * Every glossary term, sorted alphabetically by term.
 *
 * @returns {Promise<import("./schema.js").GlossaryTerm[]>}
 */
export async function getAllTerms() {
  const slugs = await listFiles(GLOSSARY_DIR, ".json");
  const terms = [];
  for (const slug of slugs) {
    const term = await loadTerm(slug);
    if (term) terms.push(term);
  }
  return terms.sort((a, b) => a.term.localeCompare(b.term));
}

/**
 * One glossary term.
 *
 * @param {string} slug
 * @returns {Promise<import("./schema.js").GlossaryTerm | null>} null when there
 *   is no such term, so the route can call notFound().
 */
export async function getTerm(slug) {
  if (!slug) return null;
  return loadTerm(slug);
}

/**
 * Read, validate and cache one guide, MDX body attached the same way a
 * programme's is.
 *
 * @param {string} slug
 * @returns {Promise<import("./schema.js").Guide | null>}
 */
async function loadGuide(slug) {
  const key = `guide:${slug}`;
  const hit = /** @type {import("./schema.js").Guide | undefined} */ (
    cached(key)
  );
  if (hit) return hit;

  const file = path.join(GUIDES_DIR, `${slug}.mdx`);
  let raw;
  try {
    raw = await readFile(file, "utf8");
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }

  let parsed;
  try {
    parsed = matter(raw);
  } catch (error) {
    throw new Error(
      `Unreadable frontmatter in ${rel(file)}: ${/** @type {Error} */ (error).message}`
    );
  }

  const frontmatter = parseOrThrow(guideSchema, parsed.data, rel(file));

  if (frontmatter.slug !== slug) {
    throw new Error(
      `Slug mismatch in ${rel(file)}: frontmatter says "${frontmatter.slug}" but the filename says "${slug}".`
    );
  }

  return remember(key, deepFreeze({ ...frontmatter, body: parsed.content }));
}

/**
 * Every guide, sorted by title.
 *
 * @returns {Promise<import("./schema.js").Guide[]>}
 */
export async function getAllGuides() {
  const slugs = await listFiles(GUIDES_DIR, ".mdx");
  const guides = [];
  for (const slug of slugs) {
    const guide = await loadGuide(slug);
    if (guide) guides.push(guide);
  }
  return guides.sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * One guide.
 *
 * @param {string} slug
 * @returns {Promise<import("./schema.js").Guide | null>} null when there is no
 *   such guide, so the route can call notFound().
 */
export async function getGuide(slug) {
  if (!slug) return null;
  return loadGuide(slug);
}

/**
 * Read, validate and cache one news update.
 *
 * @param {string} slug
 * @returns {Promise<import("./schema.js").NewsUpdate | null>}
 */
async function loadNewsUpdate(slug) {
  const key = `news:${slug}`;
  const hit = /** @type {import("./schema.js").NewsUpdate | undefined} */ (
    cached(key)
  );
  if (hit) return hit;

  const file = path.join(NEWS_DIR, `${slug}.json`);
  let raw;
  try {
    raw = await readFile(file, "utf8");
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `Invalid JSON in ${rel(file)}: ${/** @type {Error} */ (error).message}`
    );
  }

  const news = parseOrThrow(newsUpdateSchema, data, rel(file));

  if (news.slug !== slug) {
    throw new Error(
      `Slug mismatch in ${rel(file)}: record says "${news.slug}" but the filename says "${slug}".`
    );
  }

  return remember(key, deepFreeze(news));
}

/**
 * Every news update, most recent effective date first.
 *
 * @returns {Promise<import("./schema.js").NewsUpdate[]>}
 */
export async function getAllNewsUpdates() {
  const slugs = await listFiles(NEWS_DIR, ".json");
  const updates = [];
  for (const slug of slugs) {
    const update = await loadNewsUpdate(slug);
    if (update) updates.push(update);
  }
  return updates.sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));
}

/**
 * One news update.
 *
 * @param {string} slug
 * @returns {Promise<import("./schema.js").NewsUpdate | null>} null when there
 *   is no such update, so the route can call notFound().
 */
export async function getNewsUpdate(slug) {
  if (!slug) return null;
  return loadNewsUpdate(slug);
}

/**
 * News updates that reference a given country or programme slug, most recent
 * first. Used to surface a "Latest updates" block on the pages the update
 * actually names, which is what the relationship in the schema is for.
 *
 * @param {{ country?: string, program?: string }} filters
 * @returns {Promise<import("./schema.js").NewsUpdate[]>}
 */
export async function getNewsUpdatesFor({ country, program } = {}) {
  const updates = await getAllNewsUpdates();
  return updates.filter(
    (update) =>
      (country !== undefined && update.countries.includes(country)) ||
      (program !== undefined && update.programs.includes(program))
  );
}
