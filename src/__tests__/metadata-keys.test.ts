import { MetadataKeys } from "../components/input/MetadataInput";

describe("Metadata keys for subscription update", () => {
  it("should be a valid string array", () => {
    expect(
      Array.isArray(MetadataKeys) &&
        MetadataKeys.length &&
        MetadataKeys.every(key => typeof key === "string")
    ).toBeTruthy();
  });
});
