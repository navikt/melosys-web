import React, { ComponentProps } from "react";
import { mock, instance } from "ts-mockito";
import { shallow } from "enzyme";

import * as Ikoner from "../../resources/images";
import * as Nav from "../../utils/navFrontend";

import Undertittel from "./undertittel";

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

  it("viser et ikon", () => {
    props.ikon = Ikoner.ParagraphTwoColumns;
    const undertittel = shallow(<Undertittel {...props} />);
    const ikon = undertittel.find(props.ikon);

    expect(ikon).toHaveLength(1);
  });
});
