import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("../../../../../../navFrontend", () => ({
  Checkbox: ({ children, checked, onChange, readOnly }: any) => (
    <label>
      <input type="checkbox" checked={checked} onChange={onChange} readOnly={readOnly} />
      {children}
    </label>
  ),
  Alert: ({ children }: any) => <div>{children}</div>,
}));

import { UkjentSluttdatoMedlemskapsperiode } from "./ukjentSluttdatoMedlemskapsperiode";

describe("UkjentSluttdatoMedlemskapsperiode", () => {
  it("viser pensjonist-tekst når erPensjonist", () => {
    render(
      <UkjentSluttdatoMedlemskapsperiode
        ukjentSluttdatoMedlemskapsperiode={false}
        onUkjentSluttdatoChange={vi.fn()}
        erPensjonist={true}
        redigerbart={true}
      />,
    );
    expect(screen.getByText("Vedtaksbrevet skal ikke ha sluttdato")).toBeDefined();
  });

  it("viser avgiftssystem-tekst når ikke pensjonist", () => {
    render(
      <UkjentSluttdatoMedlemskapsperiode
        ukjentSluttdatoMedlemskapsperiode={false}
        onUkjentSluttdatoChange={vi.fn()}
        erPensjonist={false}
        redigerbart={true}
      />,
    );
    expect(screen.getByText("Saken er flyttet fra avgiftssystemet og har ikke sluttdato")).toBeDefined();
  });

  it("viser EØS-pensjonist-tekst når erEøsPensjonist", () => {
    render(
      <UkjentSluttdatoMedlemskapsperiode
        ukjentSluttdatoMedlemskapsperiode={false}
        onUkjentSluttdatoChange={vi.fn()}
        erEøsPensjonist={true}
        redigerbart={true}
      />,
    );
    expect(screen.getByText("Det er ikke oppgitt en sluttdato. Perioden er åpen.")).toBeDefined();
  });

  it("viser info-alert med vedtaksbrevet når checked og ikke EØS", () => {
    render(
      <UkjentSluttdatoMedlemskapsperiode
        ukjentSluttdatoMedlemskapsperiode={true}
        onUkjentSluttdatoChange={vi.fn()}
        redigerbart={true}
      />,
    );
    expect(screen.getByText(/vedtaksbrevet/)).toBeDefined();
  });

  it("viser info-alert med orienteringsbrevet når checked og EØS-pensjonist", () => {
    render(
      <UkjentSluttdatoMedlemskapsperiode
        ukjentSluttdatoMedlemskapsperiode={true}
        onUkjentSluttdatoChange={vi.fn()}
        erEøsPensjonist={true}
        redigerbart={true}
      />,
    );
    expect(screen.getByText(/orienteringsbrevet/)).toBeDefined();
  });

  it("kaller onUkjentSluttdatoChange ved endring", () => {
    const onChange = vi.fn();
    render(
      <UkjentSluttdatoMedlemskapsperiode
        ukjentSluttdatoMedlemskapsperiode={false}
        onUkjentSluttdatoChange={onChange}
        redigerbart={true}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalled();
  });
});
