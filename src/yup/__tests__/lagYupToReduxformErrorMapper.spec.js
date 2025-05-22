import * as yup from "yup";
import { lagYupToReduxformErrorMapper } from "../lagYupToReduxformErrorMapper";

// Sample error messages (could be imported if they live elsewhere and are complex)
const MAA_FYLLES_UT_OBJ = { melding: "Feltet må fylles ut" };
const MAA_FYLLES_UT_STR = "Feltet må fylles ut";
const CUSTOM_ERROR_OBJ = { _error: "Custom error" };
const CUSTOM_ERROR_STR = CUSTOM_ERROR_OBJ._error;
const MIN_LENGTH_STR = "Må være minst 5 tegn";
const MAX_LENGTH_STR = "Kan ikke være mer enn 10 tegn";
const INVALID_EMAIL_STR = "Ugyldig e-postadresse";

describe("lagYupToReduxformErrorMapper", () => {
  it("should return an empty object for valid data", () => {
    const schema = yup.object({ name: yup.string().required() });
    const mapper = lagYupToReduxformErrorMapper(schema);
    const errors = mapper({ name: "Test" });
    expect(errors).toEqual({});
  });

  it("should map a simple required error with string message", () => {
    const schema = yup.object({ name: yup.string().required(MAA_FYLLES_UT_STR) });
    const mapper = lagYupToReduxformErrorMapper(schema);
    const errors = mapper({});
    expect(errors).toEqual({ name: MAA_FYLLES_UT_STR });
  });

  it('should map a simple required error with { melding: "..." } object message', () => {
    const schema = yup.object({ name: yup.string().required(MAA_FYLLES_UT_OBJ) });
    const mapper = lagYupToReduxformErrorMapper(schema);
    const errors = mapper({});
    expect(errors).toEqual({ name: MAA_FYLLES_UT_OBJ });
  });

  it('should map a custom .test error with { _error: "..." } object message', () => {
    const schema = yup.object({
      customField: yup.string().test("custom-test", CUSTOM_ERROR_OBJ, (val) => val !== "abc"),
    });
    const mapper = lagYupToReduxformErrorMapper(schema);
    const errors = mapper({ customField: "abc" });
    expect(errors).toEqual({ customField: CUSTOM_ERROR_OBJ });
  });

  it("should map a custom .test error with a plain string message", () => {
    const schema = yup.object({
      customField: yup.string().test("custom-test", CUSTOM_ERROR_STR, () => false),
    });
    const mapper = lagYupToReduxformErrorMapper(schema);
    const errors = mapper({ customField: "abc" });
    expect(errors).toEqual({ customField: CUSTOM_ERROR_STR });
  });

  it("should map errors for nested objects", () => {
    const schema = yup.object({
      address: yup.object({
        street: yup.string().required(MAA_FYLLES_UT_STR),
        city: yup.string().required(MAA_FYLLES_UT_OBJ.melding),
      }),
    });
    const mapper = lagYupToReduxformErrorMapper(schema);
    const errors = mapper({ address: { street: "" } }); // city is missing, street is empty string
    expect(errors).toEqual({
      address: {
        street: MAA_FYLLES_UT_STR, // Assuming required fails for empty string by default
        city: MAA_FYLLES_UT_OBJ.melding, // required fails for undefined
      },
    });
  });

  it("should map errors for arrays of strings", () => {
    const schema = yup.object({
      tags: yup.array().of(yup.string().min(3, "Minst 3 tegn")).min(1, MAA_FYLLES_UT_STR),
    });
    const mapper = lagYupToReduxformErrorMapper(schema);
    // Case 1: Array is empty
    let errors = mapper({ tags: [] });
    expect(errors).toEqual({ tags: MAA_FYLLES_UT_STR }); // Error on the array itself

    // Case 2: Array has invalid item
    errors = mapper({ tags: ["ab", "abc"] }); // 'ab' is invalid, 'abc' is valid
    // e.path is 'tags', e.message is an array like ["Minst 3 tegn", undefined]
    expect(errors.tags).toBeInstanceOf(Array);
    expect(errors.tags[0]).toEqual("Minst 3 tegn");
    expect(errors.tags[1]).toBeUndefined();
  });

  it("should map errors for arrays of objects", () => {
    const itemSchema = yup.object({
      id: yup.string().required(MAA_FYLLES_UT_STR),
      value: yup.number().min(5, "Må være minst 5"),
    });
    const schema = yup.object({
      items: yup.array().of(itemSchema).min(1, "Trenger minst ett item"),
    });
    const mapper = lagYupToReduxformErrorMapper(schema);

    // Case 1: Array empty
    let errors = mapper({ items: [] });
    expect(errors).toEqual({ items: "Trenger minst ett item" }); // Error on the array itself

    // Case 2: Object in array has missing field
    errors = mapper({ items: [{ value: 10 }, { id: "ok", value: 10 }] }); // first item: id is missing
    // e.path is 'items', e.message is an array of error objects/undefined
    // e.g. [{id: "msg"}, undefined]
    expect(errors.items).toBeInstanceOf(Array);
    expect(errors.items[0]).toEqual({ id: MAA_FYLLES_UT_STR });
    expect(errors.items[1]).toBeUndefined();

    // Case 3: Object in array has field with error
    errors = mapper({ items: [{ id: "abc", value: 3 }] });
    // e.path is 'items', e.message is [{value: "Må være minst 5"}]
    expect(errors.items).toBeInstanceOf(Array);
    expect(errors.items[0]).toEqual({ value: "Må være minst 5" });
  });

  it("should handle multiple errors", () => {
    const schema = yup.object({
      name: yup.string().required(MAA_FYLLES_UT_STR),
      email: yup.string().email(INVALID_EMAIL_STR).required(MAA_FYLLES_UT_OBJ.melding),
      age: yup.number().min(18, "Må være 18+"),
    });
    const mapper = lagYupToReduxformErrorMapper(schema);
    const errors = mapper({ email: "not-an-email", age: 17 });
    expect(errors).toEqual({
      name: MAA_FYLLES_UT_STR,
      email: INVALID_EMAIL_STR, // email validator should run before required if value is present
      age: "Må være 18+",
    });
  });

  it("should handle Yup 1.x email validation (default message if not provided)", () => {
    const schema = yup.object({ email: yup.string().email().required(MAA_FYLLES_UT_STR) });
    const mapper = lagYupToReduxformErrorMapper(schema);
    const errors = mapper({ email: "invalid" });
    // Default Yup v1.x message for email is like 'email must be a valid email'
    // The exact message can vary or be localized by Yup. We check that *a* message is present.
    expect(errors.email).toBeDefined();
    expect(errors.email).not.toBe(MAA_FYLLES_UT_STR); // Make sure it's the email error, not required.
  });

  it("should correctly handle path for field with dot in name", () => {
    const schema = yup.object({ "user.name": yup.string().required(MAA_FYLLES_UT_STR) });
    const mapper = lagYupToReduxformErrorMapper(schema);
    const errors = mapper({});
    // Lodash _set handles paths with dots if they are not array/object accessors.
    // Yup's e.path for such a field will be 'user.name'.
    expect(errors).toEqual({ "user.name": MAA_FYLLES_UT_STR });
  });

  it("should use fallback message for unknown error object structure", () => {
    const UNKNOWN_ERROR_OBJ = { anUnexpectedProperty: "some value" };
    const schema = yup.object({
      problem: yup.string().test("unknown-err-test", UNKNOWN_ERROR_OBJ, () => false),
    });
    const mapper = lagYupToReduxformErrorMapper(schema);
    const errors = mapper({ problem: "value" });
    expect(errors).toEqual({ problem: "Valideringsfeil" });
  });

  // Test for abortEarly: false (default in mapper)
  it("should collect all errors when abortEarly is false", () => {
    const schema = yup.object({
      one: yup.string().required("one is required").min(5, MIN_LENGTH_STR),
      two: yup.string().required("two is required").max(3, "two too long"),
    });
    const mapper = lagYupToReduxformErrorMapper(schema);
    const errors = mapper({ one: "123", two: "1234" });
    expect(errors).toEqual({
      one: MIN_LENGTH_STR, // min length error
      two: "two too long", // max length error
    });
  });
});
