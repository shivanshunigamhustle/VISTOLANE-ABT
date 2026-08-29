import Button from "@/components/primitives/Button";

/**
 * The hand-off from a reference page into the Vistolane application.
 *
 * TODO(prompt 7): this is a stub. Prompt 7 builds the real bridge — the
 * destination URL, the intent and country parameters it carries, and whatever
 * pre-fill the application expects. The href is deliberately "#" rather than a
 * guessed portal URL, because a wrong link here is worse than an inert one.
 *
 * @param {{ program: import("@/lib/content/schema").Program }} props
 * @returns {JSX.Element}
 */
export default function ProgramBridge({ program }) {
  return (
    <div className="rounded-xl border border-separator bg-bg-grouped p-5">
      <Button href="#" variant="primary">
        Start your {program.name} application
      </Button>
    </div>
  );
}
