import { asset } from "@/lib/media";

/**
 * A photography slot.
 *
 * Zero layout shift is structural, not a discipline. The outer element is
 * always the same ratio-locked box; the image and the placeholder are both
 * absolutely positioned children that fill it. Neither participates in sizing,
 * so swapping `src: null` for a real asset cannot move anything — there is no
 * code path where it could.
 *
 * `children` render as further absolutely positioned siblings, written once, so
 * a scrim or a caption sits identically over the placeholder and over the real
 * photograph. That is what makes the overlay contrast reviewable before the
 * assets arrive.
 *
 * A slot with no photograph yet renders `fallback` when the caller supplies
 * one — a designed permanent treatment, not scaffolding — and otherwise a
 * generic placeholder. Either way the "no asset yet" state only reaches the
 * console, as a dev-only warning; production readers never see build-status
 * text on a public page.
 *
 * @param {{
 *   slot: string,
 *   className?: string,
 *   children?: React.ReactNode,
 *   fallback?: React.ReactNode,
 * }} props
 * @returns {JSX.Element}
 */
export default function Media({ slot, className = "", children, fallback }) {
  const { src, width, height, alt, note } = asset(slot);

  if (!src && process.env.NODE_ENV !== "production") {
    console.warn(`[Media] no asset configured for slot "${slot}": ${note}`);
  }

  return (
    <div
      className={`relative isolate overflow-hidden bg-bg-grouped ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? ""}
          width={width}
          height={height}
          className="absolute inset-0 size-full object-cover"
        />
      ) : fallback ? (
        <div className="absolute inset-0">{fallback}</div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-4 text-center">
          <p className="font-ui text-[0.8125rem] font-medium text-label-2">
            Image pending, client asset
          </p>
          <p className="t-data text-label-2">{note}</p>
        </div>
      )}
      {children}
    </div>
  );
}
