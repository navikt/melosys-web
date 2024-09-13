import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import * as Utils from "../../utils";

import Datovelger from ".";

describe("Datovelger", () => {
  let dato: Date | undefined = new Date();
  const props: ComponentProps<typeof Datovelger> = {
    onChange: (nyDatoString: string) => (dato = Utils.dato.norskStringTilDate(nyDatoString)),
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
    expect(datePicker).not.toHaveAttribute("readonly");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("trimmer mellomrom etter dato", () => {
    render(<Datovelger {...props} />);

    const datePicker = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(datePicker, { target: { value: "21.03.2024 " } });

    expect(datePicker.value).toBe("21.03.2024");
  });

  it("viser riktige verdier dersom datovelger er disabled", () => {
    render(<Datovelger {...{ ...props, disabled: true }} />);

    const datePicker = screen.getByLabelText("Dato");
    expect(datePicker).toHaveAttribute("readonly");
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
