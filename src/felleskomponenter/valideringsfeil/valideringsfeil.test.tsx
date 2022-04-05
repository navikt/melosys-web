import { shallow } from "enzyme";
import React from "react";

import MKV from "../../melosyskodeverk";
import Valideringsfeil from "./valideringsfeil";

describe("Valideringsfeil", () => {
  it("Viser ingenting dersom det ikke finnes en mapping for feilkode", () => {
    const valideringsfeil = shallow(<Valideringsfeil feilmeldinger={[{ kode: "tilfeldigString", felter: [] }]} />);
    const varsel = valideringsfeil.find(".varselstripe");

    expect(varsel.children().length).toBe(0);
  });

  it("Viser feilmelding fra kodeverk dersom mapping for feilkode finnes", () => {
    const valideringsfeil = shallow(
      <Valideringsfeil
        feilmeldinger={[{ kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.OVERLAPPENDE_MEDL_PERIODER, felter: [] }]}
      />
    );
    const varsel = valideringsfeil.find(".varselstripe");

    expect(varsel.children().length).toBe(1);
  });
  it("Viser punktliste med feilmeldinger dersom mer enn en feilkode sendes inn", () => {
    const valideringsfeil = shallow(
      <Valideringsfeil
        feilmeldinger={[
          { kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.OVERLAPPENDE_MEDL_PERIODER, felter: [] },
          { kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.MANGLENDE_BOSTEDSADRESSE, felter: [] },
        ]}
      />
    );
    const ul = valideringsfeil.find("ul");

    expect(ul.children().length).toBe(2);
  });
});
