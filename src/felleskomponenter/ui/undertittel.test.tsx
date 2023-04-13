import React, { ComponentProps } from "react";
import renderer from "react-test-renderer";
import { instance, mock } from "ts-mockito";

import * as Ikoner from "../../resources/images";

import Undertittel from "./undertittel";

describe("undertittel", () => {
  const mockedProps = mock<ComponentProps<typeof Undertittel>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  it("viser et ikon", () => {
    props.ikon = Ikoner.ParagraphTwoColumns;
    props.tekst = "Tekst";

    const tree = renderer.create(<Undertittel {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
