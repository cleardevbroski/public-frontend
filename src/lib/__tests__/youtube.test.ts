import { describe, expect, it } from "vitest";
import { canonicalYoutubeUrl, youtubeThumbnail, youtubeVideoId } from "../youtube";

describe("YouTube walkthrough URLs", () => {
  it.each([
    "https://youtu.be/dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=15",
    "https://youtube.com/shorts/dQw4w9WgXcQ",
    "https://youtube.com/embed/dQw4w9WgXcQ",
  ])("extracts the video ID from %s", (url) => {
    expect(youtubeVideoId(url)).toBe("dQw4w9WgXcQ");
    expect(canonicalYoutubeUrl(url)).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(youtubeThumbnail(url)).toContain("/dQw4w9WgXcQ/");
  });

  it("rejects non-YouTube and malformed URLs", () => {
    expect(youtubeVideoId("https://example.com/watch?v=dQw4w9WgXcQ")).toBe("");
    expect(youtubeVideoId("not a URL")).toBe("");
  });
});
