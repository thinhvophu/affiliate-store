import { describe, it, expect } from "vitest";
import { buildPersonSchema } from "./person-schema";
import type { Author } from "./authors";

const author: Author = {
  slug: "nguyen-van-a",
  name: "Nguyễn Văn A",
  jobTitle: "Biên tập viên",
  bio: ["Đoạn một.", "Đoạn hai."],
  avatar: "/static/images/authors/a.jpg",
  sameAs: ["https://example.org/a"],
};

describe("buildPersonSchema", () => {
  it("builds a Person with absolute url/image and the site as worksFor", () => {
    const s = buildPersonSchema(author);
    expect(s["@type"]).toBe("Person");
    expect(s.name).toBe("Nguyễn Văn A");
    expect(s.url).toBe("https://example.com/tac-gia/nguyen-van-a");
    expect(s.description).toBe("Đoạn một.");
    expect(s.jobTitle).toBe("Biên tập viên");
    expect(s.image).toBe("https://example.com/static/images/authors/a.jpg");
    expect(s.sameAs).toEqual(["https://example.org/a"]);
    expect(s.worksFor).toEqual({
      "@type": "Organization",
      name: "MuaGear",
      url: "https://example.com",
    });
  });

  it("omits optional fields when absent", () => {
    const s = buildPersonSchema({ slug: "a", name: "A", bio: ["x"] });
    expect(s).not.toHaveProperty("jobTitle");
    expect(s).not.toHaveProperty("image");
    expect(s).not.toHaveProperty("sameAs");
  });
});
