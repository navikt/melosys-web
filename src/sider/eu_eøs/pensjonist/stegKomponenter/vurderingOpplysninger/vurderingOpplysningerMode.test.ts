import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import schema from "./vurderingOpplysningerSchema";

// Verifiserer Thangs spørsmål på PR #3072: med mode "onTouched", blir steget
// regnet som gyldig etter at lagrede data lastes inn (f.eks. ved refresh av
// nettleseren), UTEN at brukeren har rørt noe felt?
//
// Vi etterligner komponentens subscription ved å lese formState.isValid under render.
const brukSkjema = (values: { fomDato: string; tomDato: string; bostedLandkode: string }) =>
  renderHook(() => {
    const {
      formState: { isValid },
      formState: { errors },
    } = useForm({
      resolver: yupResolver(schema),
      mode: "onTouched",
      values,
    });
    return { isValid, errors };
  });

describe("vurderingOpplysninger – mode onTouched og isValid", () => {
  it("isValid blir true på mount med gyldige values uten interaksjon (simulerer refresh)", async () => {
    const { result } = brukSkjema({ fomDato: "01.01.2025", tomDato: "31.12.2025", bostedLandkode: "NO" });

    await waitFor(() => expect(result.current.isValid).toBe(true));
    // og ingen feilmeldinger er surfacet uten at noe er rørt
    expect(result.current.errors).toEqual({});
  });

  it("isValid blir false med ugyldige values, men ingen feil vises før touch", async () => {
    const { result } = brukSkjema({ fomDato: "", tomDato: "", bostedLandkode: "" });

    await waitFor(() => expect(result.current.isValid).toBe(false));
    expect(result.current.errors).toEqual({});
  });
});
