import Organisasjon from "./organisasjon";
import { render } from "@testing-library/react";

describe("organisasjon", () => {
  let props = null;

  beforeEach(() => {
    props = {
      organisasjon: {
        orgnr: "123",
        navn: "Test AS",
        postadresse: {
          gateadresse: {
            gatenavn: "Oslo gate",
            husnummer: "1",
            husbokstav: "B",
          },
          land: "NO",
          postnr: "0123",
          poststed: "Oslo",
        },
      },
      redigerbart: true,
    };
  });

  it("snapshot test", () => {
    const { container } = render(<Organisasjon {...props} />);
    expect(container).toMatchSnapshot();
  });
});
