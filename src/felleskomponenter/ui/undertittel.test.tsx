import { ComponentProps } from "react";
import * as Ikoner from "../../resources/images";

import Undertittel from "./undertittel";
import { render } from "@testing-library/react";
import { expect } from "vitest";

describe("undertittel", () => {
  let props: ComponentProps<typeof Undertittel>;

  beforeEach(() => {
    props = {} as ComponentProps<typeof Undertittel>;
  });

  it("snapshot test", () => {
    props.ikon = Ikoner.ParagraphTwoColumns;
    props.tekst = "Tekst";

    const { container } = render(<Undertittel {...props} />);
    expect(container).toMatchSnapshot();
  });
});
