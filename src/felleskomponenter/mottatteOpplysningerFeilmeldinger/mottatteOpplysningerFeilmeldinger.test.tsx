import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";

import { MottatteOpplysningerFeilmeldinger } from "./mottatteOpplysningerFeilmeldinger";

describe("MottatteOpplysningerFeilmeldinger", () => {
  let props: any;

  beforeEach(() => {
    props = {
      panelFeil: [
        {
          panel: "Soknadsperiode",
          feil: ["Åpen sluttdato"],
        },
        {
          panel: "Personlig info",
          feil: ["Ugyldig fnr"],
        },
      ],
    };
  });

  it("snapshot test", () => {
    const { container } = render(<MottatteOpplysningerFeilmeldinger {...props} />);
    expect(container).toMatchSnapshot();
  });
});
