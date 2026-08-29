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
 * @param {{
 *   slot: string,
 *   className?: string,
 *   children?: React.ReactNode,
 * }} props
 * @returns {JSX.Element}
 */
export default function Media({ slot, className = "", children }) {
  const { src, width, height, alt, note } = asset(slot);

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
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-4 text-center">
          <p className="font-ui text-[0.8125rem] font-medium text-label-2">
            Image pending — client asset
          </p>
          <p className="t-data text-label-2">{note}</p>
        </div>
      )}
      {children}
    </div>
  );
}
