export interface BoilerplateRule {
  id: string;
  label: string;
  pattern: RegExp;
}

export const SELLER_BOILERPLATE_RULES: readonly BoilerplateRule[] = [
  { id: "pipe", label: '"|" segment separator', pattern: /\|/ },
  { id: "bracket", label: "[…] / 【…】 promo segment", pattern: /[[\]【】]/ },
  { id: "bang", label: '"!"', pattern: /!/ },
  { id: "chinh-hang", label: '"chính hãng"', pattern: /chính hãng/i },
  { id: "gia-re", label: '"giá rẻ"', pattern: /giá rẻ/i },
  { id: "warranty", label: '"BH/Bảo hành n tháng"', pattern: /\b(BH|Bảo hành)\s*\d+\s*tháng/i },
  { id: "freeship", label: '"Freeship"', pattern: /freeship/i },
  { id: "cam-ket", label: '"cam kết"', pattern: /cam kết/i },
];

export const MAX_DISPLAY_NAME_LENGTH = 70;
export const MIN_DISPLAY_NAME_LENGTH = 3;

const LENGTH_RULES: Record<"too-long" | "too-short", BoilerplateRule> = {
  "too-long": {
    id: "too-long",
    label: `longer than ${MAX_DISPLAY_NAME_LENGTH} chars`,
    pattern: /^/,
  },
  "too-short": {
    id: "too-short",
    label: `shorter than ${MIN_DISPLAY_NAME_LENGTH} chars`,
    pattern: /^/,
  },
};

/** Every rule a display name breaks, incl. length; [] = clean. */
export function findBoilerplateViolations(name: string): BoilerplateRule[] {
  const violations = SELLER_BOILERPLATE_RULES.filter((r) => r.pattern.test(name));
  const trimmed = name.trim();
  if (trimmed.length > MAX_DISPLAY_NAME_LENGTH) violations.push(LENGTH_RULES["too-long"]);
  if (trimmed.length < MIN_DISPLAY_NAME_LENGTH) violations.push(LENGTH_RULES["too-short"]);
  return violations;
}
