import { fireEvent, render, screen } from "@testing-library/react";
import { useFieldArray, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { BOOLSK_STRING } from "../../../constants";
import { Inntektskilder } from "./inntektskilder";
import { FormValuesProps } from "./types";

vi.mock("react-redux", () => ({
  useSelector: () => "",
}));

vi.mock("../../forms", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../forms")>()),
  Datovelger: () => null,
  RadioGroup: () => null,
}));

let hentVerdier: () => FormValuesProps;

function Skjema() {
  const { control, watch, getValues } = useForm<FormValuesProps>({
    defaultValues: {
      inntektskilder: [{ fomDato: "01.01.2026", tomDato: "31.12.2026", kildetype: "" }],
      skatteforholdsperioder: [{ fomDato: "01.01.2026", tomDato: "31.12.2026", skatteplikttype: "IKKE_SKATTEPLIKTIG" }],
    },
  });
  const { fields, update, remove, append } = useFieldArray({ control, name: "inntektskilder" });
  hentVerdier = getValues;

  return (
    <Inntektskilder
      formValues={watch()}
      fields={fields}
      control={control}
      update={update}
      remove={remove}
      append={append}
      redigerbart
      medlemskapsTypeErPliktig
      skalViseErMaanedsBelopRadioGroup
    />
  );
}

describe("Inntektskilder", () => {
  it("lagrer månedsbeløp i skjemaet når Periode viser «Md.» etter valg av inntektskilde", () => {
    render(<Skjema />);

    fireEvent.change(screen.getByLabelText("Inntektskilde"), { target: { value: "PENSJON" } });

    const periode = screen.getByLabelText<HTMLSelectElement>("Periode");
    expect(periode.selectedOptions[0].textContent).toBe("Md.");
    expect(hentVerdier().inntektskilder[0]).toMatchObject({
      kildetype: "PENSJON",
      erMaanedsbelop: BOOLSK_STRING.SANN,
    });
  });
});
