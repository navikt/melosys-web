import React, { ComponentProps } from "react";
import { shallow } from "enzyme";
import { mock, instance } from "ts-mockito";

import GyldigPeriode from "./gyldigPeriode";

describe("GyldigPeriode", () => {
  const mockedProps = mock<ComponentProps<typeof GyldigPeriode>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  it("dersom ikke historisk, viser bare fom", () => {
    props.erHistorisk = false;
    props.periode = { fom: "2015-01-01", tom: "2020-01-01" };

    const gyldigPeriode = shallow(<GyldigPeriode {...props} />);

    expect(gyldigPeriode.contains("01.01.2015")).toBe(true);
    expect(gyldigPeriode.contains("01.01.2020")).toBe(false);
  });

  it("dersom periode er historisk, viser fom og tom dersom begge er oppgitt", () => {
    props.erHistorisk = true;
    props.periode = { fom: "2015-01-01", tom: "2020-01-01" };

    const gyldigPeriode = shallow(<GyldigPeriode {...props} />);

    expect(gyldigPeriode.contains("01.01.2015 - 01.01.2020")).toBe(true);
  });

  it("dersom periode er historisk, viser bare fom dersom tom ikke er oppgitt", () => {
    props.erHistorisk = true;
    props.periode = { fom: "2015-01-01", tom: undefined };

    const gyldigPeriode = shallow(<GyldigPeriode {...props} />);

    expect(gyldigPeriode.contains("01.01.2015 - ")).toBe(true);
  });

  it("dersom periode er historisk, viser bare tom dersom fom ikke er oppgitt", () => {
    props.erHistorisk = true;
    props.periode = { fom: null, tom: "2020-01-01" };

    const gyldigPeriode = shallow(<GyldigPeriode {...props} />);

    expect(gyldigPeriode.contains(" - 01.01.2020")).toBe(true);
  });

  it("dersom periode er historisk, viser ingenting dersom hverken fom eller tom er oppgitt", () => {
    props.erHistorisk = true;
    props.periode = { fom: null, tom: undefined };

    const gyldigPeriode = shallow(<GyldigPeriode {...props} />);

    expect(gyldigPeriode.text()).toBe("");
  });
});
