import {
  MAX_DISPLAY_NAME_LENGTH,
  MIN_DISPLAY_NAME_LENGTH,
  SELLER_BOILERPLATE_RULES,
} from "@/lib/seller-boilerplate";

const SEPARATORS = "-–—,+/:;·•*\\s";
const EDGE_SEPARATORS = new RegExp(`^[${SEPARATORS}]+|[${SEPARATORS}]+$`, "g");
const REPEATED_SEPARATORS = /([-–—,+/:;])(?:\s*[-–—,+/:;])+/g;
const EMPTY_PARENS = /\(\s*\)/g;

const PHRASE_RULE_IDS = new Set(["chinh-hang", "gia-re", "warranty", "freeship", "cam-ket"]);
const PHRASE_PATTERNS = SELLER_BOILERPLATE_RULES.filter((r) => PHRASE_RULE_IDS.has(r.id)).map(
  (r) => new RegExp(r.pattern.source, "gi"),
);

function tidy(text: string): string {
  return text
    .replace(EMPTY_PARENS, " ")
    .replace(REPEATED_SEPARATORS, "$1")
    .replace(/\s+/g, " ")
    .replace(EDGE_SEPARATORS, "");
}

/** Strips seller boilerplate from a scraped title; null when nothing usable is left. */
export function cleanDealName(raw: string): string | null {
  let name = raw.replace(/\[[^\]]*\]|【[^】]*】/g, " ");
  name = name.split("|")[0];
  name = name.replace(/!/g, " ");
  name = name.replace(/hàng\s+chính hãng/gi, " ");
  for (const pattern of PHRASE_PATTERNS) name = name.replace(pattern, " ");
  name = tidy(name);

  if (name.length > MAX_DISPLAY_NAME_LENGTH) {
    const cut = name.slice(0, MAX_DISPLAY_NAME_LENGTH + 1);
    const lastSpace = cut.lastIndexOf(" ");
    name = tidy(lastSpace > 0 ? cut.slice(0, lastSpace) : cut.slice(0, MAX_DISPLAY_NAME_LENGTH));
  }

  return name.length < MIN_DISPLAY_NAME_LENGTH ? null : name;
}
