import { describe, expect, it } from "vitest";
import { mergeUploadedMedia } from "@/lib/propertyMediaState";

describe("property media state", () => {
  it("appends an async upload to the latest photos instead of a stale snapshot", () => {
    const stateAfterFirstUpload = mergeUploadedMedia([], ["first.jpg"]);
    const stateAfterSecondUpload = mergeUploadedMedia(stateAfterFirstUpload, ["second.jpg"]);
    expect(stateAfterSecondUpload).toEqual(["first.jpg", "second.jpg"]);
  });

  it("deduplicates retried uploads and enforces the hero limit", () => {
    expect(mergeUploadedMedia(["one.jpg", "two.jpg"], ["two.jpg", "three.jpg", "four.jpg"], 3))
      .toEqual(["one.jpg", "two.jpg", "three.jpg"]);
  });
});
