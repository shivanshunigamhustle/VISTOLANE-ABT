import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const THROUGH_THE_LOADER =
  "Content is read through lib/content/loader.js. Pages, routes and components " +
  "must not import from content/ or touch the filesystem — add a function to the " +
  "loader instead.";

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "out/**", "build/**"],
  },
  ...compat.extends("next/core-web-vitals", "prettier"),
  {
    // The loader is the only seam between the site and the content files. This
    // keeps that true mechanically rather than by memory.
    files: ["app/**/*.js", "components/**/*.js"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "content/*",
                "@/content/*",
                "**/content/*.json",
                "**/*.mdx",
              ],
              message: THROUGH_THE_LOADER,
            },
          ],
          paths: [
            { name: "fs", message: THROUGH_THE_LOADER },
            { name: "node:fs", message: THROUGH_THE_LOADER },
            { name: "fs/promises", message: THROUGH_THE_LOADER },
            { name: "node:fs/promises", message: THROUGH_THE_LOADER },
            { name: "gray-matter", message: THROUGH_THE_LOADER },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
