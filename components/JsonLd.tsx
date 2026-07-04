interface JsonLdProps {
  data: Record<string, unknown>;
}

const LINE_SEPARATOR_RE = new RegExp("\\u2028", "g");
const PARAGRAPH_SEPARATOR_RE = new RegExp("\\u2029", "g");

/**
 * `JSON.stringify` alone does not sanitize a `</script>` close-tag injection
 * inside a `<script type="application/ld+json">` body -- escape `<` (and the
 * JSON-legal- but JS-illegal line/paragraph separators) before serializing.
 */
export function escapeJsonForScriptTag(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(LINE_SEPARATOR_RE, "\\u2028")
    .replace(PARAGRAPH_SEPARATOR_RE, "\\u2029");
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: escapeJsonForScriptTag(data) }}
    />
  );
}
