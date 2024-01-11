import { MottatteOpplysningerFeilmeldinger } from "./mottatteOpplysningerFeilmeldinger";
import { render } from "@testing-library/react";

describe("MottatteOpplysningerFeilmeldinger", () => {
  let props = null;

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
