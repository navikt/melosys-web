import React, { ComponentProps } from "react";
import { mock, instance } from "ts-mockito";
import { shallow } from "enzyme";

import * as Ikoner from "../../resources/images";
import * as Nav from "../../utils/navFrontend";

import Undertittel, { IkonOrientering } from "./undertittel";

describe("undertittel", () => {
  const mockedProps = mock<ComponentProps<typeof Undertittel>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  it("viser en nav undertittel", () => {
    const undertittel = shallow(<Undertittel {...props} />);

    expect(undertittel.find(Nav.Typo.Undertittel)).toHaveLength(1);
  });

  it("kan vise ikon til venstre for tekst", () => {
    props.ikon = Ikoner.ParagraphTwoColumns;
    props.ikonOrientering = IkonOrientering.Venstre;
    const undertittel = shallow(<Undertittel {...props} />);
    const navUndertittel = undertittel.find(Nav.Typo.Undertittel);
    const ikonErTilVenstre = navUndertittel.children().first().is(Ikoner.ParagraphTwoColumns);

    expect(ikonErTilVenstre).toBe(true);
  });

  it("kan vise ikon til høyre for tekst", () => {
    props.ikon = Ikoner.ParagraphTwoColumns;
    props.ikonOrientering = IkonOrientering.Hoyre;
    const undertittel = shallow(<Undertittel {...props} />);
    const navUndertittel = undertittel.find(Nav.Typo.Undertittel);
    const ikonErTilHoyre = navUndertittel.children().last().is(Ikoner.ParagraphTwoColumns);

    expect(ikonErTilHoyre).toBe(true);
  });
});
