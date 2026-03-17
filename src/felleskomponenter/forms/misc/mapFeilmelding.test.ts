import { describe, it, expect } from "vitest";
import { getErrorMessage } from "./mapFeilmelding";

describe("getErrorMessage", () => {
  it("returnerer melding for enkelt felt", () => {
    const field = { name: "fornavn" } as any;
    const formState = {
      errors: { fornavn: { message: { melding: "Påkrevd" } } },
    } as any;

    expect(getErrorMessage(field, formState)).toBe("Påkrevd");
  });

  it("returnerer undefined når ingen feil finnes", () => {
    const field = { name: "fornavn" } as any;
    const formState = { errors: {} } as any;

    expect(getErrorMessage(field, formState)).toBeUndefined();
  });

  it("returnerer melding for array-felt med index", () => {
    const field = { name: "virksomheter[0].orgnr" } as any;
    const formState = {
      errors: {
        virksomheter: [{ orgnr: { message: { melding: "Ugyldig orgnr" } } }],
      },
    } as any;

    expect(getErrorMessage(field, formState)).toBe("Ugyldig orgnr");
  });

  it("returnerer undefined for array-felt uten feil", () => {
    const field = { name: "virksomheter[0].orgnr" } as any;
    const formState = { errors: {} } as any;

    expect(getErrorMessage(field, formState)).toBeUndefined();
  });

  it("returnerer melding for enkelt felt med ren streng som feilmelding", () => {
    const field = { name: "begrunnelseFritekst" } as any;
    const formState = {
      errors: { begrunnelseFritekst: { message: "Du kan ikke skrive mer enn 4000 tegn" } },
    } as any;

    expect(getErrorMessage(field, formState)).toBe("Du kan ikke skrive mer enn 4000 tegn");
  });

  it("returnerer melding for array-felt med ren streng som feilmelding", () => {
    const field = { name: "perioder[0].startdato" } as any;
    const formState = {
      errors: {
        perioder: [{ startdato: { message: "Startdato er påkrevd" } }],
      },
    } as any;

    expect(getErrorMessage(field, formState)).toBe("Startdato er påkrevd");
  });
});
