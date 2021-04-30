import React from "react";

import * as Ikoner from "../../resources/images";
import * as Nav from "../../utils/navFrontend";

import Undertittel from "./undertittel";

describe("undertittel", () => {
  let props = null;

  beforeEach(() => {
    props = {
      ikon: Ikoner.ParagraphTwoColumns,
      tekst: "Tittel",
      className: "klasse",
    };
  });

  it("viser en nav undertittel", () => {
    const undertittel = shallow(<Undertittel {...props} />);

    expect(undertittel.find(Nav.Typo.Undertittel)).toHaveLength(1);
  });

  it("viser et ikon", () => {
    const undertittel = shallow(<Undertittel {...props} />);
    const ikon = undertittel.find(props.ikon);

    expect(ikon).toHaveLength(1);
  });
});
