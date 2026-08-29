import { redirectRules } from "./lib/seo/redirects.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The floating dev-tools badge sits over the bottom-left of every page and
  // ends up in every screenshot. Off, so captures show the site and not the
  // toolchain.
  devIndicators: false,
  // Any URL that has ever been deployed and then changed must appear in
  // lib/seo/redirects.js. See the rule documented there.
  redirects: redirectRules,
};

export default nextConfig;
