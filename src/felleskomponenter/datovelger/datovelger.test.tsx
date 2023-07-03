import { ComponentProps } from "react";
import { shallow } from "enzyme";

import DatePicker from "react-datepicker";
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

  it("viser riktige verdier med default props", () => {
    const datovelger = shallow(<Datovelger {...props} />);
    const label = datovelger.find(".datovelger__label");
    const input = datovelger.find(DatePicker);
    const feilmelding = datovelger.find(".datovelger__feilmelding");

    expect(label).toHaveLength(1);
    expect(label.children().text()).toBe(props.label);

    expect(input).toHaveLength(1);
    expect(input.prop("className")).toBe("datovelger__input input--fullbredde");
    expect(input.prop("selected")).toBe(dato);
    expect(input.prop("locale")).toBe("nb");
    expect(input.prop("dateFormat")).toStrictEqual([
      "dd.MM.yyyy",
      "ddMMyyyy",
      "ddMMyy",
      "dd.MM.yy",
      "dd/MM/yyyy",
      "dd/MM/yy",
      "dd-MM-yyyy",
      "dd-MM-yy",
    ]);
    expect(input.prop("disabled")).toBe(false);
    expect(input.prop("onChange")).toBe(props.onChange);

    expect(feilmelding.exists()).toBeFalsy();
  });

  it("viser riktige verdier dersom datovelger er disabled", () => {
    const datovelger = shallow(<Datovelger {...{ ...props, disabled: true }} />);
    const input = datovelger.find(DatePicker);

    expect(input.prop("disabled")).toBe(true);
    expect(input.prop("className")).toContain("datovelger__input_disabled");
  });

  it("viser riktige verdier dersom feilmelding vises", () => {
    const feilmeldingTekst = "Feilmeldingstekst";
    const datovelger = shallow(<Datovelger {...{ ...props, feil: feilmeldingTekst }} />);
    const input = datovelger.find(DatePicker);
    const feilmelding = datovelger.find(".datovelger__feilmelding");

    expect(input.prop("className")).toContain("datovelger__input_feil");

    expect(feilmelding).toHaveLength(1);
    expect(feilmelding.children().text()).toBe(feilmeldingTekst);
  });
});
