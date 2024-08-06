import { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";
import * as Ikoner from "../../resources/images";

import Undertittel from "./undertittel";
import { render } from "@testing-library/react";
import { expect } from "vitest";

describe("undertittel", () => {
  const mockedProps = mock<ComponentProps<typeof Undertittel>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  it("snapshot test", () => {
    props.ikon = Ikoner.ParagraphTwoColumns;
    props.tekst = "Tekst";

    const { container } = render(<Undertittel {...props} />);
    expect(container).toMatchSnapshot();
  });
});
