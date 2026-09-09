import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../../navFrontend", () => ({
  Row: ({ children }: any) => <div>{children}</div>,
  Column: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("../../../../../felleskomponenter/forms", () => ({
  Datovelger: () => <div data-testid="datovelger" />,
  Select: ({ children }: any) => <div data-testid="select">{children}</div>,
}));

vi.mock("../../../../../felleskomponenter/ui", () => ({
  IkonKnapp: (props: any) => <button type="button" aria-label={props.ariaLabel} disabled={props.disabled} />,
  Lenkeknapp: ({ children, onClick, disabled }: any) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("../../../../../resources/images", () => ({
  Add: () => <span />,
  Bin: () => <span />,
}));

vi.mock("../hooks/usePliktigeBestemmelser", () => ({
  usePliktigeBestemmelser: () => ["FTRL_2_7"],
}));

import { AvgiftspliktigperiodeSkjema } from "./medlemskapsperiodeSkjema";

const LEGG_TIL_TEKST = "Legg til periode fra avgiftssystemet";

const lagProps = (overstyr: Record<string, unknown> = {}) => ({
  redigerbart: true,
  control: {} as any,
  field: { id: "1" },
  remove: vi.fn(),
  formValues: {
    bestemmelse: "",
    avgiftspliktigperioder: [{ fomDato: "01.01.2023", tomDato: "31.12.2023", redigerbar: true }],
  } as any,
  handleLeggTil: vi.fn(),
  index: 0,
  visLeggTil: true,
  setValue: vi.fn(),
  trygdedekninger: [],
  ...overstyr,
});

describe("AvgiftspliktigperiodeSkjema - Legg til periode-knapp", () => {
  it("viser knappen med ny tekst for siste periode", () => {
    render(<AvgiftspliktigperiodeSkjema {...lagProps()} />);
    expect(screen.getByRole("button", { name: LEGG_TIL_TEKST })).toBeDefined();
  });

  it("viser knappen når det er svart Ja på avviksspørsmålet", () => {
    render(<AvgiftspliktigperiodeSkjema {...lagProps({ visLeggTil: true })} />);
    expect(screen.getByRole("button", { name: LEGG_TIL_TEKST })).toBeDefined();
  });

  it("skjuler knappen når det ikke er svart Ja på avviksspørsmålet", () => {
    render(<AvgiftspliktigperiodeSkjema {...lagProps({ visLeggTil: false })} />);
    expect(screen.queryByRole("button", { name: LEGG_TIL_TEKST })).toBeNull();
  });

  it("skjuler knappen når skjemaet ikke er redigerbart", () => {
    render(<AvgiftspliktigperiodeSkjema {...lagProps({ redigerbart: false })} />);
    expect(screen.queryByRole("button", { name: LEGG_TIL_TEKST })).toBeNull();
  });

  it("kaller handleLeggTil når knappen klikkes", () => {
    const handleLeggTil = vi.fn();
    render(<AvgiftspliktigperiodeSkjema {...lagProps({ handleLeggTil })} />);
    screen.getByRole("button", { name: LEGG_TIL_TEKST }).click();
    expect(handleLeggTil).toHaveBeenCalledOnce();
  });

  it("skjuler knappen for pliktig bestemmelse uten delt grunnlag", () => {
    render(
      <AvgiftspliktigperiodeSkjema
        {...lagProps({
          formValues: {
            bestemmelse: "FTRL_2_7",
            avgiftspliktigperioder: [{ fomDato: "01.01.2023", tomDato: "31.12.2023", redigerbar: true }],
          },
          erDeltGrunnlag: false,
        })}
      />,
    );
    expect(screen.queryByRole("button", { name: LEGG_TIL_TEKST })).toBeNull();
  });

  it("viser knappen for pliktig bestemmelse når grunnlaget er delt", () => {
    render(
      <AvgiftspliktigperiodeSkjema
        {...lagProps({
          formValues: {
            bestemmelse: "FTRL_2_7",
            avgiftspliktigperioder: [{ fomDato: "01.01.2023", tomDato: "31.12.2023", redigerbar: true }],
          },
          erDeltGrunnlag: true,
        })}
      />,
    );
    expect(screen.getByRole("button", { name: LEGG_TIL_TEKST })).toBeDefined();
  });
});
