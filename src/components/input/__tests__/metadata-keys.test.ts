import { MetadataKeys } from "../MetadataInput";

describe("Metadata keys for subscription update", () => {
  it("should be a valid string array", () => {
    expect(Array.isArray(MetadataKeys)).toBe(true);
    expect(MetadataKeys.length).toBeGreaterThan(0);
    expect(MetadataKeys.every(key => typeof key === "string")).toBe(true);
  });
});
