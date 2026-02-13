import { describe, expect, it } from "vitest";
import { computeFingerprint } from "../services/fingerprint.js";

describe("computeFingerprint", () => {
  it("is deterministic regardless of object identity", () => {
    const filesA = [
      { relativePath: "a.txt", content: "one" },
      { relativePath: "b.txt", content: "two" }
    ];
    const filesB = [
      { relativePath: "a.txt", content: "one" },
      { relativePath: "b.txt", content: "two" }
    ];

    expect(computeFingerprint(filesA)).toEqual(computeFingerprint(filesB));
  });
});
