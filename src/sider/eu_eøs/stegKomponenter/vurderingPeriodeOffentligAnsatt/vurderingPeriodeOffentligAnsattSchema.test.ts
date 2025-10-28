import { describe, expect, it } from "vitest";
import type { ValidationError } from "yup";

import vurderingPeriodeOffentligAnsattSchema from "./vurderingPeriodeOffentligAnsattSchema";

interface FormValues {
  lovvalgsbestemmelse?: string;
  forkortLovvalgsperiode?: boolean;
  fomDato?: string;
  tomDato?: string;
}

const validate = async (
  values: Partial<FormValues>,
  context?: { soknadsperiode: { fom: string; tom: string } },
): Promise<ValidationError | null> => {
  try {
    await vurderingPeriodeOffentligAnsattSchema.validate(values, {
      abortEarly: false,
      context,
    });
    return null;
  } catch (e: unknown) {
    return e as ValidationError;
  }
};

const hasError = (e: ValidationError | null, path: string): boolean => {
  if (!e) return false;
  const paths = Array.isArray(e.inner) ? e.inner.map((x) => x.path) : e.path ? [e.path] : [];
  return paths.includes(path);
};

const getErrorMessage = (e: ValidationError | null, path: string): string | undefined => {
  if (!e || !Array.isArray(e.inner)) return undefined;
  const error = e.inner.find((x) => x.path === path);
  const message = error?.message;
  // Handle both string and { melding: string } formats
  if (typeof message === "string") return message;
  if (message && typeof message === "object" && "melding" in message) {
    return (message as { melding: string }).melding;
  }
  return undefined;
};

describe("vurderingPeriodeOffentligAnsattSchema", () => {
  describe("AC11: Lovvalgsbestemmelse er required", () => {
    it("feiler når lovvalgsbestemmelse mangler", async () => {
      const err = await validate({
        forkortLovvalgsperiode: false,
      });

      expect(hasError(err, "lovvalgsbestemmelse")).toBe(true);
      expect(getErrorMessage(err, "lovvalgsbestemmelse")).toBe("Velg en bestemmelse.");
    });

    it("validerer når lovvalgsbestemmelse er satt", async () => {
      const err = await validate({
        lovvalgsbestemmelse: "FO_883_2004_ART11_3B",
        forkortLovvalgsperiode: false,
      });

      expect(err).toBeNull();
    });
  });

  describe("AC12: Datofelter required når forkortLovvalgsperiode er huket av", () => {
    it("feiler når fomDato mangler og forkortLovvalgsperiode er true", async () => {
      const err = await validate(
        {
          lovvalgsbestemmelse: "FO_883_2004_ART11_3B",
          forkortLovvalgsperiode: true,
          tomDato: "31.12.2024",
        },
        {
          soknadsperiode: { fom: "2024-01-01", tom: "2024-12-31" },
        },
      );

      expect(hasError(err, "fomDato")).toBe(true);
      expect(getErrorMessage(err, "fomDato")).toBe("Må fylles ut");
    });

    it("feiler når tomDato mangler og forkortLovvalgsperiode er true", async () => {
      const err = await validate(
        {
          lovvalgsbestemmelse: "FO_883_2004_ART11_3B",
          forkortLovvalgsperiode: true,
          fomDato: "01.01.2024",
        },
        {
          soknadsperiode: { fom: "2024-01-01", tom: "2024-12-31" },
        },
      );

      expect(hasError(err, "tomDato")).toBe(true);
      expect(getErrorMessage(err, "tomDato")).toBe("Må fylles ut");
    });

    it("validerer når begge datoer er satt og forkortLovvalgsperiode er true", async () => {
      const err = await validate(
        {
          lovvalgsbestemmelse: "FO_883_2004_ART11_3B",
          forkortLovvalgsperiode: true,
          fomDato: "01.01.2024",
          tomDato: "31.12.2024",
        },
        {
          soknadsperiode: { fom: "2024-01-01", tom: "2024-12-31" },
        },
      );

      expect(err).toBeNull();
    });

    it("validerer når datofelter mangler og forkortLovvalgsperiode er false", async () => {
      const err = await validate({
        lovvalgsbestemmelse: "FO_883_2004_ART11_3B",
        forkortLovvalgsperiode: false,
      });

      expect(err).toBeNull();
    });
  });

  describe("AC13: Datoer må være gyldige", () => {
    it("feiler når fomDato er ugyldig (30. februar)", async () => {
      const err = await validate(
        {
          lovvalgsbestemmelse: "FO_883_2004_ART11_3B",
          forkortLovvalgsperiode: true,
          fomDato: "30.02.2024", // Ugyldig dato
          tomDato: "2024-12-31",
        },
        {
          soknadsperiode: { fom: "2024-01-01", tom: "2024-12-31" },
        },
      );

      expect(hasError(err, "fomDato")).toBe(true);
    });

    it("feiler når tomDato er ugyldig", async () => {
      const err = await validate(
        {
          lovvalgsbestemmelse: "FO_883_2004_ART11_3B",
          forkortLovvalgsperiode: true,
          fomDato: "2024-01-01",
          tomDato: "31.13.2024", // Ugyldig måned
        },
        {
          soknadsperiode: { fom: "2024-01-01", tom: "2024-12-31" },
        },
      );

      expect(hasError(err, "tomDato")).toBe(true);
    });
  });

  describe("AC14: Datoer må være i riktig rekkefølge", () => {
    it("feiler når tomDato er før fomDato", async () => {
      const err = await validate(
        {
          lovvalgsbestemmelse: "FO_883_2004_ART11_3B",
          forkortLovvalgsperiode: true,
          fomDato: "01.06.2024",
          tomDato: "01.05.2024", // Før fomDato
        },
        {
          soknadsperiode: { fom: "2024-01-01", tom: "2024-12-31" },
        },
      );

      expect(hasError(err, "tomDato")).toBe(true);
    });

    it("validerer når tomDato er etter fomDato", async () => {
      const err = await validate(
        {
          lovvalgsbestemmelse: "FO_883_2004_ART11_3B",
          forkortLovvalgsperiode: true,
          fomDato: "01.01.2024",
          tomDato: "01.06.2024",
        },
        {
          soknadsperiode: { fom: "2024-01-01", tom: "2024-12-31" },
        },
      );

      expect(err).toBeNull();
    });
  });

  describe("AC15: Datoer må være innenfor søknadsperioden", () => {
    it("feiler når fomDato er før søknadsperioden", async () => {
      const err = await validate(
        {
          lovvalgsbestemmelse: "FO_883_2004_ART11_3B",
          forkortLovvalgsperiode: true,
          fomDato: "01.12.2023", // Før søknadsperiode
          tomDato: "01.06.2024",
        },
        {
          soknadsperiode: { fom: "2024-01-01", tom: "2024-12-31" },
        },
      );

      expect(hasError(err, "fomDato")).toBe(true);
    });

    it("feiler når tomDato er etter søknadsperioden", async () => {
      const err = await validate(
        {
          lovvalgsbestemmelse: "FO_883_2004_ART11_3B",
          forkortLovvalgsperiode: true,
          fomDato: "01.06.2024",
          tomDato: "01.01.2025", // Etter søknadsperiode
        },
        {
          soknadsperiode: { fom: "2024-01-01", tom: "2024-12-31" },
        },
      );

      expect(hasError(err, "tomDato")).toBe(true);
    });

    it("validerer når begge datoer er innenfor søknadsperioden", async () => {
      const err = await validate(
        {
          lovvalgsbestemmelse: "FO_883_2004_ART11_3B",
          forkortLovvalgsperiode: true,
          fomDato: "01.03.2024",
          tomDato: "01.09.2024",
        },
        {
          soknadsperiode: { fom: "2024-01-01", tom: "2024-12-31" },
        },
      );

      expect(err).toBeNull();
    });
  });
});
