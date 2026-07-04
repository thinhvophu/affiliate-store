import { describe, it, expect } from "vitest";
import { escapeJsonForScriptTag } from "./JsonLd";

describe("escapeJsonForScriptTag", () => {
  it("escapes < so a </script> payload cannot close the script tag", () => {
    const json = escapeJsonForScriptTag({
      malicious: "</script><script>alert(1)</script>",
    });
    expect(json).not.toContain("</script>");
    expect(json).toContain("\\u003c/script>");
  });

  it("escapes U+2028 and U+2029 line/paragraph separators", () => {
    const json = escapeJsonForScriptTag({ text: "line one line two end" });
    expect(json).not.toContain(" ");
    expect(json).not.toContain(" ");
    expect(json).toContain("\\u2028");
    expect(json).toContain("\\u2029");
  });
});
