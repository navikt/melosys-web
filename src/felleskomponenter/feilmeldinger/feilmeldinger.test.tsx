import { shallow } from "enzyme";
import React from "react";

import MKV from "../../melosyskodeverk";
import Feilmeldinger from "./feilmeldinger";

describe("Feilmeldinger", () => {
  it("Viser ingenting dersom det ikke finnes en mapping for feilkode", () => {
    const feilmeldinger = shallow(<Feilmeldinger feilmeldinger={[{ kode: "tilfeldigString", felter: [] }]} />);
    const varsel = feilmeldinger.find(".varselstripe");

    expect(varsel.children().length).toBe(0);
  });

  it("Viser feilmelding fra kodeverk dersom mapping for feilkode finnes", () => {
    const feilmeldinger = shallow(
      <Feilmeldinger
        feilmeldinger={[{ kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.OVERLAPPENDE_MEDL_PERIODER, felter: [] }]}
      />
    );
    const varsel = feilmeldinger.find(".varselstripe");

    expect(varsel.children().length).toBe(1);
  });
  it("Viser punktliste med feilmeldinger dersom mer enn en feilkode sendes inn", () => {
    const feilmeldinger = shallow(
      <Feilmeldinger
        feilmeldinger={[
          { kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.OVERLAPPENDE_MEDL_PERIODER, felter: [] },
          { kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.MANGLENDE_BOSTEDSADRESSE, felter: [] },
        ]}
      />
    );
    const ul = feilmeldinger.find("ul");

    expect(ul.children().length).toBe(2);
  });
});
