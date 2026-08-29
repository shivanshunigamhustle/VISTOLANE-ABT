/**
 * Injects a JSON-LD block.
 *
 * The `<` escape matters: a string inside a record could contain a literal
 * "</script>" and end the block early, which would put the rest of the JSON into
 * the document as markup. Escaping it to the \\u003c form is still valid JSON
 * and cannot close the tag.
 *
 * @param {{ schema: object | null }} props
 * @returns {JSX.Element | null}
 */
export default function JsonLd({ schema }) {
  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}
