import { describe, expect, it } from "vitest";

import { htmlToText } from "@/lib/html-to-text";

describe("htmlToText", () => {
  it("strips tags and keeps readable text on separate lines", () => {
    const html =
      "<html><body><h1>Développeur Full-Stack</h1><p>Chez Acme, à distance.</p></body></html>";

    expect(htmlToText(html)).toBe("Développeur Full-Stack\nChez Acme, à distance.");
  });

  it("removes script and style blocks entirely", () => {
    const html = "<style>.a{color:red}</style><script>alert('x')</script><p>Texte utile</p>";

    expect(htmlToText(html)).toBe("Texte utile");
  });

  it("decodes common HTML entities", () => {
    const html = "<p>Node.js &amp; React &mdash; 35&nbsp;000&nbsp;&euro;</p>"
      .replace("&mdash;", "-")
      .replace("&euro;", "EUR");

    expect(htmlToText(html)).toBe("Node.js & React - 35 000 EUR");
  });

  it("truncates to maxLength", () => {
    const html = `<p>${"a".repeat(100)}</p>`;

    expect(htmlToText(html, 10)).toHaveLength(10);
  });
});
