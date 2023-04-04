import React, { ComponentProps } from "react";
import { shallow } from "enzyme";
import { mock, instance } from "ts-mockito";

import * as Nav from "../../../../../../navFrontend";

import SpesiellGruppeHjelpetekst from "./spesiellGruppeHjelpeTekst";

describe("SpesiellGruppeHjelpetekst", () => {
  const mockedProps = mock<ComponentProps<typeof SpesiellGruppeHjelpetekst>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  it("Viser grupper som er relevante for norske virksomheter", () => {
    props.erVirksomhetNorsk = true;

    const spesiellGruppeHjelpetekst = shallow(<SpesiellGruppeHjelpetekst {...props} />);

    expect(spesiellGruppeHjelpetekst.contains("Misjonærer som skal arbeide i utlandet i minst to år")).toBe(true);
    expect(spesiellGruppeHjelpetekst.contains("Arbeidstakere i Malaysia")).toBe(true);

    const navHjelpetekst = spesiellGruppeHjelpetekst.find(Nav.Hjelpetekst);
    expect(navHjelpetekst.props().tittel).toContain("Misjonærer som skal arbeide i utlandet i minst to år");
    expect(navHjelpetekst.props().tittel).toContain("Arbeidstakere i Malaysia");
  });

  it("Viser grupper som er relevante for utenlandske virksomheter", () => {
    props.erVirksomhetNorsk = false;

    const spesiellGruppeHjelpetekst = shallow(<SpesiellGruppeHjelpetekst {...props} />);

    expect(spesiellGruppeHjelpetekst.contains("Ansatte i FN som betaler staff assessment")).toBe(true);
    expect(spesiellGruppeHjelpetekst.contains("Arbeidstakere i Malaysia")).toBe(true);

    const navHjelpetekst = spesiellGruppeHjelpetekst.find(Nav.Hjelpetekst);
    expect(navHjelpetekst.props().tittel).toContain("Ansatte i FN som betaler staff assessment");
    expect(navHjelpetekst.props().tittel).toContain("Arbeidstakere i Malaysia");
  });
});
