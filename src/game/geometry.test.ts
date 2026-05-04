import { describe, expect, it } from "vitest";
import { overlap } from "./geometry";

describe("overlap", () => {
  it("detects intersection", () => {
    expect(overlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 5, y: 5, w: 10, h: 10 })).toBe(true);
  });

  it("returns false when separated", () => {
    expect(overlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 20, y: 20, w: 5, h: 5 })).toBe(false);
  });
});
