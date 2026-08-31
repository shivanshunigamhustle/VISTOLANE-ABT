/**
 * A tabular reader for structured record fields.
 *
 * The table lives inside its own horizontally scrollable container, so a wide
 * table scrolls within itself and the page body never scrolls sideways. The
 * table itself carries a min-width so a narrow viewport triggers that scroll
 * instead of squeezing every column down to one word per line. Long unbroken
 * values wrap anywhere rather than forcing the column open.
 *
 * @typedef {Object} DataTableColumn
 * @property {string} key                        Property to read from each row.
 * @property {string} label                      Column heading.
 * @property {"left" | "right" | "center"} [align]
 * @property {boolean} [mono]                    Tabular figures for numeric columns.
 * @property {string} [width]                    CSS width hint, e.g. "22%". Auto layout
 *   otherwise lets one long prose column starve the rest.
 * @property {boolean} [nowrap]                  Keep short labels on one line, so a badge
 *   in a narrow column cannot be broken mid-word.
 *
 * A row may carry `rowAccent`, a CSS colour rendered as a 3px left rail on
 * that row — used on the routes table, where the six intent hues do real
 * navigational work rather than decoration. It is set on the first cell
 * rather than the <tr> itself: box-shadow on table rows does not render
 * consistently across browsers, a border on a cell does.
 */

/** @type {Record<string, string>} */
const ALIGN = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

/**
 * @param {{
 *   columns: DataTableColumn[],
 *   rows: Array<Record<string, React.ReactNode> & { rowAccent?: string }>,
 *   caption?: string,
 *   viewport?: boolean,
 *   capClass?: string,
 * }} props
 * @returns {JSX.Element}
 */
export default function DataTable({
  columns,
  rows,
  caption,
  viewport = false,
  capClass = "sm:max-h-[70vh]",
}) {
  // The height cap is added at `sm` and up rather than removed below it. On a
  // phone the whole viewport is already the scroll container, and a second one
  // nested inside it traps the thumb — a reader swiping to leave the table
  // scrolls the table instead. Desktop has a cursor, a visible scrollbar and
  // room for the page around it, so there the cap is what makes the table
  // readable rather than what makes it a trap.
  // capClass sets how tall the scroll region is allowed to get. A tool page
  // gives the table most of the screen; a landing-page section wants a much
  // shorter window, because there the table is evidence that the data exists
  // rather than the thing the reader came to read.
  const frame = viewport
    ? `w-full overflow-x-auto overflow-y-auto overscroll-contain border-y border-rule ${capClass}`
    : "w-full overflow-x-auto border-y border-rule";

  // border-separate, not border-collapse: a collapsed border belongs to the
  // table rather than to the cell, so it does not travel with a sticky header
  // and the heading row would scroll over the body with no rule beneath it.
  // Every cell already draws its own bottom border, so this looks identical.
  const grid = viewport
    ? "w-full min-w-[720px] border-separate border-spacing-0 text-sm"
    : "w-full min-w-[720px] border-collapse text-sm";

  const headCell = `border-b border-rule px-4 py-2.5 font-ui text-[0.6875rem] font-semibold uppercase tracking-[0.09em] text-label-2 ${
    viewport ? "sticky top-0 z-10 bg-surface" : ""
  }`;

  return (
    <div className={frame}>
      <table className={grid}>
        {caption ? (
          <caption className="caption-top px-4 pb-3 pt-4 text-left text-label-2">
            {caption}
          </caption>
        ) : null}
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                style={column.width ? { width: column.width } : undefined}
                className={`${headCell} ${
                  ALIGN[column.align] ?? ALIGN.left
                } ${column.nowrap ? "whitespace-nowrap" : ""}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="color-transition hover:bg-fill">
              {columns.map((column, columnIndex) => (
                <td
                  key={column.key}
                  style={
                    columnIndex === 0 && row.rowAccent
                      ? { borderLeft: `3px solid ${row.rowAccent}` }
                      : undefined
                  }
                  className={`border-b border-separator px-4 py-2.5 align-top text-label ${
                    column.nowrap
                      ? "whitespace-nowrap"
                      : "[overflow-wrap:anywhere]"
                  } ${ALIGN[column.align] ?? ALIGN.left} ${
                    column.mono ? "font-data tabular-nums" : ""
                  }`}
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
