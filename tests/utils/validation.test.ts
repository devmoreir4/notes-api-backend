import { AppError } from "../../src/errors/app-error";
import {
  ensureNonEmptyString,
  ensureObjectBody,
  ensureOptionalQueryString,
  ensureOptionalString,
  ensurePositiveInteger,
  ensureStringArray,
  ensureTagsQuery,
} from "../../src/utils/validation";

describe("validation utilities", () => {
  it("accepts a valid object body", () => {
    expect(ensureObjectBody({ title: "Note" })).toEqual({ title: "Note" });
  });

  it("rejects invalid object bodies", () => {
    expect(() => ensureObjectBody(null)).toThrow(AppError);
    expect(() => ensureObjectBody([])).toThrow("Request body must be a valid object.");
  });

  it("validates required strings", () => {
    expect(ensureNonEmptyString(" note ", "title")).toBe("note");
    expect(() => ensureNonEmptyString("", "title")).toThrow('Field "title" is required.');
  });

  it("validates optional strings", () => {
    expect(ensureOptionalString("  description ", "description")).toBe("description");
    expect(ensureOptionalString(undefined, "description")).toBeUndefined();
    expect(() => ensureOptionalString(123, "description")).toThrow(
      'Field "description" must be a string.',
    );
  });

  it("validates string arrays", () => {
    expect(ensureStringArray(["work", "study"], "tags")).toEqual(["work", "study"]);
    expect(ensureStringArray(undefined, "tags")).toEqual([]);
    expect(() => ensureStringArray(["ok", 2], "tags")).toThrow(
      'Field "tags" must contain only strings.',
    );
  });

  it("validates positive integers", () => {
    expect(ensurePositiveInteger("12", "id")).toBe(12);
    expect(() => ensurePositiveInteger("0", "id")).toThrow(
      'Field "id" must be a positive integer.',
    );
  });

  it("normalizes optional query strings", () => {
    expect(ensureOptionalQueryString("  hello ")).toBe("hello");
    expect(ensureOptionalQueryString(undefined)).toBeUndefined();
  });

  it("parses tags query strings", () => {
    expect(ensureTagsQuery(" work, study , api ")).toEqual(["work", "study", "api"]);
    expect(ensureTagsQuery(undefined)).toEqual([]);
  });
});
