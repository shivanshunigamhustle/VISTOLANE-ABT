"use client";

import Button from "@/components/primitives/Button";

/**
 * Opens the browser's print dialog.
 *
 * A progressive enhancement, not the mechanism: the print stylesheet
 * (styles/globals.css, @media print) applies whether or not this button
 * exists — a reader can always print from the browser's own menu. This is
 * only a convenience shortcut, so it is the one place on the page allowed to
 * need JavaScript.
 *
 * @returns {JSX.Element}
 */
export default function PrintButton() {
  return (
    <Button
      type="button"
      variant="quiet"
      onClick={() => window.print()}
    >
      Print this checklist
    </Button>
  );
}
