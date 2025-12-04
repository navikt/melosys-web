import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import * as Utils from "../../utils";

import Datovelger from ".";

describe("Datovelger", () => {
  let dato: Date | undefined = new Date();
  const props: ComponentProps<typeof Datovelger> = {
    onChange: (nyDatoString: string) => (dato = Utils.dato.norskStringTilDate(nyDatoString)),
    value: dato,
    label: "Dato",
    readOnly: false,
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

    expect(dato).toEqual(Utils.dato.norskStringTilDate("21.03.2024"));
  });

  it("viser riktige verdier dersom datovelger er disabled", () => {
    render(<Datovelger {...{ ...props, readOnly: true }} />);

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

  describe("forhindreAutoUtfylling", () => {
    it("forhindrer ikke auto-utfylling når forhindreAutoUtfylling er false", () => {
      const onChange = vi.fn();
      render(<Datovelger {...props} onChange={onChange} forhindreAutoUtfylling={false} />);

      const datePicker = screen.getByRole("textbox") as HTMLInputElement;

      // Skriv ufullstendig dato
      fireEvent.change(datePicker, { target: { value: "15.03" } });
      fireEvent.blur(datePicker);

      // Skal ha forsøkt å formatere (selv om det blir ugyldig)
      expect(onChange).toHaveBeenCalled();
    });

    it("forhindrer auto-utfylling av ufullstendige datoer når forhindreAutoUtfylling er true", () => {
      const onChange = vi.fn();
      render(<Datovelger {...props} onChange={onChange} forhindreAutoUtfylling={true} />);

      const datePicker = screen.getByRole("textbox") as HTMLInputElement;

      // Skriv ufullstendig dato (mindre enn 6 tegn)
      fireEvent.change(datePicker, { target: { value: "01" } });
      fireEvent.blur(datePicker);

      // onChange skal ha blitt kalt under change, men onBlur skal ikke formatere
      expect(datePicker.value).toBe("01");
    });

    it("sender rå verdi til onChange ved onBlur når input er for kort", () => {
      const onChange = vi.fn();
      render(<Datovelger {...props} onChange={onChange} forhindreAutoUtfylling={true} />);

      const datePicker = screen.getByRole("textbox") as HTMLInputElement;

      // Skriv ugyldig dato
      fireEvent.change(datePicker, { target: { value: "abc" } });
      onChange.mockClear(); // Nullstill for å bare fange onBlur-kallet

      fireEvent.blur(datePicker);

      // onChange skal kalles med den rå verdien ved onBlur (for validering)
      expect(onChange).toHaveBeenCalledWith("abc");
    });

    it("sender rå verdi til onChange for datoer med ugyldige tegn", () => {
      const onChange = vi.fn();
      render(<Datovelger {...props} onChange={onChange} forhindreAutoUtfylling={true} />);

      const datePicker = screen.getByRole("textbox") as HTMLInputElement;

      // Skriv dato med ugyldig tegn på slutten
      fireEvent.change(datePicker, { target: { value: "01.01.2025s" } });

      // onChange skal kalles med den rå verdien under change
      expect(onChange).toHaveBeenCalledWith("01.01.2025s");
    });

    it("tillater formatering av komplette datoer selv når forhindreAutoUtfylling er true", () => {
      const onChange = vi.fn();
      render(<Datovelger {...props} onChange={onChange} forhindreAutoUtfylling={true} />);

      const datePicker = screen.getByRole("textbox") as HTMLInputElement;

      // Skriv komplett dato (6+ tegn uten separatorer)
      fireEvent.change(datePicker, { target: { value: "150324" } });
      fireEvent.blur(datePicker);

      // Skal ha formatert til norsk datoformat
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall[0]).toMatch(/\d{2}\.\d{2}\.\d{4}/); // dd.mm.yyyy format
    });
  });

  describe("laasAar", () => {
    it("legger til år fra minDate når bruker skriver bare dag og måned", () => {
      const onChange = vi.fn();
      const minDate = new Date(2024, 0, 1); // 1. januar 2024
      const maxDate = new Date(2024, 11, 31); // 31. desember 2024

      render(<Datovelger {...props} onChange={onChange} laasAar={true} minDate={minDate} maxDate={maxDate} />);

      const datePicker = screen.getByRole("textbox") as HTMLInputElement;

      // Skriv bare dag og måned
      fireEvent.change(datePicker, { target: { value: "15.03" } });
      fireEvent.blur(datePicker);

      // Skal ha lagt til 2024
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall[0]).toBe("15.03.2024");
    });

    it("legger til år fra minDate når bruker skriver ddmm uten punktum", () => {
      const onChange = vi.fn();
      const minDate = new Date(2024, 0, 1);
      const maxDate = new Date(2024, 11, 31);

      render(<Datovelger {...props} onChange={onChange} laasAar={true} minDate={minDate} maxDate={maxDate} />);

      const datePicker = screen.getByRole("textbox") as HTMLInputElement;

      // Skriv ddmm format
      fireEvent.change(datePicker, { target: { value: "1503" } });
      fireEvent.blur(datePicker);

      // Skal ha lagt til 2024 og formatert
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall[0]).toBe("15.03.2024");
    });

    it("legger ikke til år når laasAar er false", () => {
      const onChange = vi.fn();
      const minDate = new Date(2024, 0, 1);
      const maxDate = new Date(2024, 11, 31);

      render(<Datovelger {...props} onChange={onChange} laasAar={false} minDate={minDate} maxDate={maxDate} />);

      const datePicker = screen.getByRole("textbox") as HTMLInputElement;

      // Skriv bare dag og måned
      fireEvent.change(datePicker, { target: { value: "15.03" } });
      fireEvent.blur(datePicker);

      // Skal IKKE ha lagt til år automatisk
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall[0]).not.toBe("15.03.2024");
    });

    it("håndterer allerede komplette datoer når laasAar er true", () => {
      const onChange = vi.fn();
      const minDate = new Date(2024, 0, 1);
      const maxDate = new Date(2024, 11, 31);

      render(<Datovelger {...props} onChange={onChange} laasAar={true} minDate={minDate} maxDate={maxDate} />);

      const datePicker = screen.getByRole("textbox") as HTMLInputElement;

      // Skriv komplett dato
      fireEvent.change(datePicker, { target: { value: "15.03.2024" } });
      fireEvent.blur(datePicker);

      // Skal ikke endre datoen siden den allerede er komplett
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall[0]).toBe("15.03.2024");
    });
  });

  describe("onDateChange håndtering", () => {
    it("kaller ikke onChange når DatePicker returnerer undefined dato", () => {
      const onChange = vi.fn();
      render(<Datovelger {...props} onChange={onChange} />);

      const datePicker = screen.getByRole("textbox") as HTMLInputElement;

      // Simuler at brukeren skriver en ugyldig dato
      // DatePicker vil kalle onDateChange med undefined, men vi skal ikke overskrive verdien
      fireEvent.change(datePicker, { target: { value: "ugyldig" } });

      // onChange skal ha blitt kalt med den rå verdien fra handleOnChange
      expect(onChange).toHaveBeenCalledWith("ugyldig");

      // Verdien i input-feltet skal fortsatt være det brukeren skrev
      expect(datePicker.value).toBe("ugyldig");
    });

    it("beholder brukerens input selv om den er ugyldig", () => {
      const onChange = vi.fn();
      render(<Datovelger {...props} onChange={onChange} />);

      const datePicker = screen.getByRole("textbox") as HTMLInputElement;

      // Skriv en gyldig dato først
      fireEvent.change(datePicker, { target: { value: "01.01.2025" } });
      expect(onChange).toHaveBeenCalledWith("01.01.2025");

      // Legg til et ugyldig tegn
      fireEvent.change(datePicker, { target: { value: "01.01.2025x" } });
      expect(onChange).toHaveBeenCalledWith("01.01.2025x");

      // Input-verdien skal være det brukeren skrev, ikke overskrevet av DatePicker
      expect(datePicker.value).toBe("01.01.2025x");
    });
  });

  describe("kombinasjon av forhindreAutoUtfylling og laasAar", () => {
    it("håndterer begge props samtidig korrekt", () => {
      const onChange = vi.fn();
      const minDate = new Date(2024, 0, 1);
      const maxDate = new Date(2024, 11, 31);

      render(
        <Datovelger
          {...props}
          onChange={onChange}
          forhindreAutoUtfylling={true}
          laasAar={true}
          minDate={minDate}
          maxDate={maxDate}
        />,
      );

      const datePicker = screen.getByRole("textbox") as HTMLInputElement;

      // Test 1: Ufullstendig dato (2 tegn) - skal ikke auto-fylles
      fireEvent.change(datePicker, { target: { value: "01" } });
      fireEvent.blur(datePicker);
      expect(datePicker.value).toBe("01");

      // Test 2: Dag/måned (4 tegn) - skal få år lagt til
      onChange.mockClear();
      fireEvent.change(datePicker, { target: { value: "15.03" } });
      fireEvent.blur(datePicker);

      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall[0]).toBe("15.03.2024");
    });
  });

  describe("brukInternValidering", () => {
    it("viser ikke feilmelding for gyldig dato", () => {
      render(<Datovelger {...props} brukInternValidering={true} />);

      const datePicker = screen.getByRole("textbox") as HTMLInputElement;

      fireEvent.change(datePicker, { target: { value: "15.03.2024" } });
      fireEvent.blur(datePicker);

      // Skal ikke vise feilmelding for gyldig dato
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("viser feilmelding for ugyldig dato når brukInternValidering er true", async () => {
      render(<Datovelger {...props} brukInternValidering={true} />);

      const datePicker = screen.getByRole("textbox") as HTMLInputElement;

      // Skriv en ugyldig dato (32. dag finnes ikke)
      fireEvent.change(datePicker, { target: { value: "32.03.2024" } });
      fireEvent.blur(datePicker);

      // Venter på at intern validering skal kjøre
      const feilmelding = await screen.findByRole("alert");
      expect(feilmelding).toBeInTheDocument();
      expect(feilmelding).toHaveTextContent("Skriv inn en gyldig dato");
    });

    it("viser ikke intern feilmelding når brukInternValidering er false", () => {
      render(<Datovelger {...props} brukInternValidering={false} />);

      const datePicker = screen.getByRole("textbox") as HTMLInputElement;

      // Skriv en ugyldig dato
      fireEvent.change(datePicker, { target: { value: "32.03.2024" } });
      fireEvent.blur(datePicker);

      // Skal ikke vise intern feilmelding (validering håndteres av parent)
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("edge cases for datoformatering", () => {
    it("håndterer tom streng uten feil", () => {
      const onChange = vi.fn();
      render(<Datovelger {...props} onChange={onChange} />);

      const datePicker = screen.getByRole("textbox") as HTMLInputElement;

      fireEvent.change(datePicker, { target: { value: "" } });
      fireEvent.blur(datePicker);

      // Skal ikke krasje, og onChange skal ha blitt kalt med tom streng
      expect(onChange).toHaveBeenCalledWith("");
    });

    it("håndterer kun punktum uten feil", () => {
      const onChange = vi.fn();
      render(<Datovelger {...props} onChange={onChange} forhindreAutoUtfylling={true} />);

      const datePicker = screen.getByRole("textbox") as HTMLInputElement;

      fireEvent.change(datePicker, { target: { value: ".." } });
      fireEvent.blur(datePicker);

      // Skal sende rå verdi siden den er for kort
      expect(onChange).toHaveBeenCalledWith("..");
    });

    it("håndterer spesialtegn i input", () => {
      const onChange = vi.fn();
      render(<Datovelger {...props} onChange={onChange} forhindreAutoUtfylling={true} />);

      const datePicker = screen.getByRole("textbox") as HTMLInputElement;

      fireEvent.change(datePicker, { target: { value: "abc!@#" } });
      fireEvent.blur(datePicker);

      // Skal sende rå verdi
      expect(onChange).toHaveBeenCalledWith("abc!@#");
    });
  });
});
