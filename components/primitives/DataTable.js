/**
 * A tabular reader for structured record fields.
 *
 * The table lives inside its own horizontally scrollable container, so a wide
 * table scrolls within itself and the page body never scrolls sideways. Long
 * unbroken values wrap anywhere rather than forcing the column open.
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
 *   rows: Array<Record<string, React.ReactNode>>,
 *   caption?: string,
 * }} props
 * @returns {JSX.Element}
 */
export default function DataTable({ columns, rows, caption }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-separator">
      <table className="w-full border-collapse text-sm">
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
                className={`border-b border-separator px-4 py-2.5 font-ui text-xs font-semibold uppercase tracking-wide text-label-2 ${
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
            <tr key={index}>
              {columns.map((column) => (
                <td
                  key={column.key}
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
