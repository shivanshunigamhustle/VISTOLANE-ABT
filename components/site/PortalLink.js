import Button from "@/components/primitives/Button";
import { buildPortalUrl } from "@/lib/bridge";

/**
 * Sign-in link for people who already have an application in progress.
 *
 * Deliberately a server component: it carries no parameters and no attribution,
 * so there is nothing to add at hydration and no reason to ship JavaScript for
 * it. Attaching campaign attribution to a returning customer's sign-in would
 * also be wrong — they were acquired long ago.
 *
 * It points at the application root rather than a sign-in path, because no
 * sign-in path has been confirmed and guessing one would be inventing a URL
 * (OPN-07). The application decides where an unauthenticated visitor lands.
 *
 * @param {{ onInk?: boolean }} [props]
 * @returns {JSX.Element}
 */
export default function PortalLink({ onInk = false } = {}) {
  return (
    <Button
      href={buildPortalUrl({ path: "/" })}
      variant={onInk ? "onInk" : "quiet"}
    >
      Sign in to your portal
    </Button>
  );
}
