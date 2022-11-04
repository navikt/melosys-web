import { isDeepEmpty } from "./object";

describe("isDeepEmpty", () => {
  test("tom string returnerer true", () => {
    const input = "";
    expect(isDeepEmpty(input)).toEqual(true);
  });

  test("tom objekt returnerer true", () => {
    const input = {};
    expect(isDeepEmpty(input)).toEqual(true);
  });

  test("nested tomt objekt returnerer true", () => {
    const input = {
      felt: "",
    };
    expect(isDeepEmpty(input)).toEqual(true);
  });

  test("enda mer nested tomt objekt returnerer true", () => {
    const input = {
      yttersteFelt: {
        innersteFelt: {
          0: "",
        },
      },
    };
    expect(isDeepEmpty(input)).toEqual(true);
  });

  test("nested objekt med ett ikke-tomt felt returnerer false", () => {
    const input = {
      yttersteFelt: {
        innersteFelt: {
          0: "",
          1: "Ikke tom",
        },
      },
    };
    expect(isDeepEmpty(input)).toEqual(false);
  });
});
