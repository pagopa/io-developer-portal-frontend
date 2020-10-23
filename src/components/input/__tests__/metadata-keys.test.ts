import { MetadataKeys, SortedMetadata } from "../MetadataInput";

describe("Metadata keys for subscription update", () => {
  it("should be a valid string array", () => {
    expect(Array.isArray(MetadataKeys)).toBe(true);
    expect(MetadataKeys.length).toBeGreaterThan(0);
    expect(MetadataKeys.every(key => typeof key === "string")).toBe(true);
  });
});

describe("Sorted Metadata keys for subscription update", () => {
  it("should be a valid string array", () => {
    expect(Array.isArray(SortedMetadata)).toBe(true);
    expect(SortedMetadata.length).toBeGreaterThan(0);
    expect(SortedMetadata.every(key => typeof key === "string")).toBe(true);
  });
});
