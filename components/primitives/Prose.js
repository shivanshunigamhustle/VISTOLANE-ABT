/**
 * The reading surface for long-form MDX bodies.
 *
 * This is a document, not a UI: the serif reading stack, a measure capped at
 * 68ch, and leading loose enough to read a thousand words without fatigue.
 * Headings switch to the UI stack so they read as structure rather than prose.
 *
 * Element styling is scoped with descendant variants rather than a global
 * stylesheet, so it applies only to rendered body content and never leaks into
 * the surrounding interface. Tables inside a body scroll within themselves for
 * the same reason DataTable does — the page must never scroll sideways.
 */
const PROSE = [
  "max-w-[68ch] font-read text-[1.0625rem] leading-[1.75] text-label",
  "[&_h2]:mt-12 [&_h2]:mb-3 [&_h2]:scroll-mt-24 [&_h2]:font-ui [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:leading-snug",
  "[&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:scroll-mt-24 [&_h3]:font-ui [&_h3]:text-lg [&_h3]:font-semibold",
  "[&_p]:my-4",
  "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6",
  "[&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6",
  "[&_li]:my-1.5 [&_li]:pl-1",
  "[&_a]:text-tint [&_a]:underline [&_a]:underline-offset-2 [&_a]:[overflow-wrap:anywhere]",
  "[&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-tint",
  "[&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:border-rule [&_blockquote]:pl-4 [&_blockquote]:text-label-2",
  "[&_code]:rounded-inline [&_code]:bg-fill [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-data [&_code]:text-[0.875em]",
  "[&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-inline [&_pre]:bg-bg-grouped [&_pre]:p-4",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_table]:my-6 [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:border-collapse [&_table]:font-ui [&_table]:text-sm",
  "[&_th]:border-b [&_th]:border-rule [&_th]:py-2 [&_th]:pr-4 [&_th]:text-left [&_th]:font-semibold",
  "[&_td]:border-b [&_td]:border-rule [&_td]:py-2 [&_td]:pr-4 [&_td]:align-top",
  "[&_hr]:my-10 [&_hr]:border-rule",
  "[&_strong]:font-semibold",
  "[&_img]:my-6 [&_img]:rounded-media",
].join(" ");

/**
 * @param {{ className?: string, children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export default function Prose({ className = "", children }) {
  return <div className={`${PROSE} ${className}`.trim()}>{children}</div>;
}
