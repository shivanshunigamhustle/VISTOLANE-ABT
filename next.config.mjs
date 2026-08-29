import { redirectRules } from "./lib/seo/redirects.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Any URL that has ever been deployed and then changed must appear in
  // lib/seo/redirects.js. See the rule documented there.
  redirects: redirectRules,
};

export default nextConfig;
