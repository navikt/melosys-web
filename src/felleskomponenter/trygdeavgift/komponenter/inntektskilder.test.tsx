import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BOOLSK_STRING } from "../../../constants";
import { Inntektskilder } from "./inntektskilder";

vi.mock("react-redux", () => ({
  useSelector: () => "",
}));

vi.mock("../../../navFrontend", () => ({
  Alert: ({ children }: any) => <div>{children}</div>,
  BodyLong: ({ children }: any) => <div>{children}</div>,
  Column: ({ children }: any) => <div>{children}</div>,
  Radio: ({ children }: any) => <div>{children}</div>,
  Row: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("../../forms", () => ({
  Datovelger: () => null,
  Input: () => null,
  RadioGroup: () => null,
  Select: ({ label, onChange, children }: any) =>
    label === "Inntektskilde" ? (
      <button onClick={() => onChange("PENSJON")}>Velg inntektskilde</button>
    ) : (
      <div>{children}</div>
    ),
}));

vi.mock("../../ui", () => ({
  IkonKnapp: () => null,
  Lenkeknapp: ({ children }: any) => <button>{children}</button>,
}));

vi.mock("../../../resources/images", () => ({
  Add: () => null,
  Bin: () => null,
}));

describe("Inntektskilder", () => {
  it("setter månedsbeløp når kildetype endres og feltet ikke er registrert ennå", () => {
    const update = vi.fn();
    const inntektskilde = {
      fomDato: "01.01.2026",
      tomDato: "31.12.2026",
      kildetype: "",
    };

    render(
      <Inntektskilder
        formValues={{
          inntektskilder: [inntektskilde],
          skatteforholdsperioder: [],
        }}
        fields={[{ id: "inntekt-1" }] as any}
        control={{} as any}
        update={update}
        remove={vi.fn()}
        append={vi.fn()}
        redigerbart
        medlemskapsTypeErPliktig
        skalViseErMaanedsBelopRadioGroup
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Velg inntektskilde" }));

    expect(update).toHaveBeenCalledWith(0, {
      ...inntektskilde,
      kildetype: "PENSJON",
      arbAvgBetales: BOOLSK_STRING.USANN,
      erMaanedsbelop: BOOLSK_STRING.SANN,
    });
  });
});
