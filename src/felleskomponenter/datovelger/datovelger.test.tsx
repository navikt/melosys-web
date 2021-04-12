import React, { ComponentProps } from "react";
import { shallow } from "enzyme";

import DatePicker from "react-datepicker";
import Datovelger from "./datovelger";

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
    const label = datovelger.find(".datofelt__label");
    const input = datovelger.find(DatePicker);
    const feilmelding = datovelger.find(".datofelt__feilmelding");

    expect(label).toHaveLength(1);
    expect(label.children().text()).toBe(props.label);

    expect(input).toHaveLength(1);
    expect(input.prop("className")).toBe("datofelt__input input--fullbredde");
    expect(input.prop("selected")).toBe(dato);
    expect(input.prop("locale")).toBe("nb");
    expect(input.prop("dateFormat")).toBe("dd.MM.yyyy");
    expect(input.prop("placeholderText")).toBe("Velg en dato");
    expect(input.prop("disabled")).toBe(false);

    expect(feilmelding.exists()).toBeFalsy();
  });

  it("skal kunne endres dersom datovelger er enabled", () => {
    const nyDato = new Date("2021-10-30");
    const datovelger = shallow(<Datovelger {...props} />);
    const input = datovelger.find(DatePicker);

    input.simulate("change", nyDato);
    expect(dato).toBe(nyDato);
  });

  it("viser riktige verdier dersom datovelger er disabled", () => {
    const datovelger = shallow(<Datovelger {...{ ...props, disabled: true }} />);
    const input = datovelger.find(DatePicker);

    expect(input.prop("disabled")).toBe(true);
    expect(input.prop("className")).toBe("datofelt__input input--fullbredde datofelt__input_disabled");
  });

  it("viser riktige verdier dersom feilmelding vises", () => {
    const feilmeldingTekst = "Feilmeldingstekst";
    const datovelger = shallow(<Datovelger {...{ ...props, feil: feilmeldingTekst }} />);
    const input = datovelger.find(DatePicker);
    const feilmelding = datovelger.find(".datofelt__feilmelding");

    expect(input.prop("className")).toBe("datofelt__input input--fullbredde datofelt__input_feil");
    expect(input.prop("placeholderText")).toBe("");

    expect(feilmelding).toHaveLength(1);
    expect(feilmelding.children().text()).toBe(feilmeldingTekst);
  });
});
