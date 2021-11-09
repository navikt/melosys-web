import React, { ComponentProps, MouseEvent } from "react";
import { shallow } from "enzyme";
import { mock, instance } from "ts-mockito";

import * as Nav from "../../../../../../navFrontend";
import * as Utils from "../../../../../../utils";

import KopierbarTekst from "../../../../../kopierbarTekst";
import Ident from "./ident";
import Informasjonsmodal from "./informasjonsmodal";

describe("Ident", () => {
  const mockedProps = mock<ComponentProps<typeof Ident>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  it("viser kopierbar ident", () => {
    const generator = new Utils.testhelpers.Generator();
    const generatedFnr = generator.generateBirthNumber();
    props.ident = generatedFnr;

    const ident = shallow(<Ident {...props} />);

    expect(ident.find(KopierbarTekst).children().text()).toContain(generatedFnr);
  });

  it("har mulighet til å vise modal hvis visMerInformasjon er true", () => {
    props.visMerInformasjon = true;

    const ident = shallow(<Ident {...props} />);

    const knapp = ident.find(Nav.Flatknapp);
    expect(knapp).toHaveLength(1);
    expect(knapp.children().text()).toBe("Vis mer informasjon");

    const mockedMouseEvent = mock<MouseEvent<HTMLButtonElement>>();
    const mouseEvent = instance(mockedMouseEvent);
    knapp.props().onClick?.(mouseEvent);

    const informasjonsmodal = ident.find(Informasjonsmodal);
    expect(informasjonsmodal).toHaveLength(1);

    informasjonsmodal.props().onRequestClose?.();
    expect(ident.find(Informasjonsmodal)).toHaveLength(0);
  });

  it("viser ikke knapp for å åpne modal med mer informasjon, hvis visMerInformasjon er false", () => {
    props.visMerInformasjon = false;

    const ident = shallow(<Ident {...props} />);

    const knapp = ident.find(Nav.Flatknapp);
    expect(knapp).toHaveLength(0);
  });
});
