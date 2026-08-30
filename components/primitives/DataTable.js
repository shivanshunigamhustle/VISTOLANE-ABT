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
 * }} props
 * @returns {JSX.Element}
 */
export default function DataTable({ columns, rows, caption }) {
  return (
    <div className="w-full overflow-x-auto border-y border-rule">
      <table className="w-full min-w-[720px] border-collapse text-sm">
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
                className={`border-b border-rule px-4 py-2.5 font-ui text-[0.6875rem] font-semibold uppercase tracking-[0.09em] text-label-2 ${
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
