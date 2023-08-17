import { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";

import Datovelger from ".";

describe("Datovelger", () => {
  let dato = new Date();
  const props: ComponentProps<typeof Datovelger> = {
    onChange: (nyDato: Date) => (dato = nyDato),
    value: dato,
    label: "Dato",
    disabled: false,
    feil: undefined,
    bredde: undefined,
  };

  it("viser riktige verdier med default props", async () => {
    render(<Datovelger {...props} />);

    expect(screen.getByText("Dato")).toBeInTheDocument();

    const datePicker = screen.getByText("Dato").parentElement;
    expect(datePicker).toHaveClass("datovelger__input input--fullbredde");
    expect(datePicker).not.toBeDisabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("viser riktige verdier dersom datovelger er disabled", () => {
    render(<Datovelger {...{ ...props, disabled: true }} />);

    const datePicker = screen.getByLabelText("Dato");
    expect(datePicker).toHaveAttribute("disabled");
    expect(datePicker).toBeDisabled();
  });

  it("viser riktige verdier dersom feilmelding vises", () => {
    const feilmeldingTekst = "Feilmeldingstekst";
    render(<Datovelger {...{ ...props, feil: feilmeldingTekst }} />);

    const datePickerWrapper = screen.getByLabelText("Dato").parentNode?.parentNode;
    const feilmelding = screen.getByRole("alert");

    expect(datePickerWrapper).toHaveClass("datovelger__input_feil");

    expect(feilmelding).toBeInTheDocument();
    expect(feilmelding).toHaveTextContent(feilmeldingTekst);
  });
});
