import { MottatteOpplysningerFeilmeldinger } from "./mottatteOpplysningerFeilmeldinger";

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

  it("viser en liste over paneler som har feil", () => {
    const mottatteOpplysningerFeilmeldinger = shallow(<MottatteOpplysningerFeilmeldinger {...props} />);

    const lis = mottatteOpplysningerFeilmeldinger.find("li");

    expect(lis.containsMatchingElement("Soknadsperiode"));
    expect(lis.containsMatchingElement("Personlig info"));
  });

  it("viser ingenting hvis ingen panelfeil", () => {
    props.panelFeil = [];
    const mottatteOpplysningerFeilmeldinger = shallow(<MottatteOpplysningerFeilmeldinger {...props} />);

    expect(mottatteOpplysningerFeilmeldinger.isEmptyRender()).toBe(true);
  });
});
