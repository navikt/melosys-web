import { shallow } from "enzyme";
import React from "react";

import * as KV from "../../../kodeverk";
import MKV from "../../../melosyskodeverk";
import Valideringsfeil, { Feilbeskrivelse } from "./Valideringsfeil";

describe("Valideringsfeil", () => {
  it('Viser feilmelding "Ukjent feil" dersom det ikke finnes en mapping for feilkode', () => {
    const valideringsfeil = shallow(<Valideringsfeil feilkode={{ kode: "tilfeldigString", felter: [] }} />);
    const feilbeskrivelse = valideringsfeil.find(Feilbeskrivelse);

    expect(feilbeskrivelse).toHaveLength(1);
    expect(feilbeskrivelse.props().tittel).toBe("Ukjent feil");
  });

  it("viser feilmelding fra kodeverk dersom ingen mapping for feilkode finnes, og kontrollkode stammer fra manglende utfylling av felter", () => {
    const valideringsfeil = shallow(
      <Valideringsfeil
        feilkode={{ kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.MANGLENDE_BOSTEDSADRESSE, felter: [] }}
      />
    );

    const feilbeskrivelse = valideringsfeil.find(Feilbeskrivelse);
    expect(feilbeskrivelse).toHaveLength(1);

    expect(feilbeskrivelse.props().tittel).toBe("Manglende utfylling");
    expect(feilbeskrivelse.props().innhold).toBe(
      KV.kodeTilTerm(
        MKV.Koder.begrunnelser.kontroll_begrunnelser.MANGLENDE_BOSTEDSADRESSE,
        MKV.KTObjects.begrunnelser.kontroll_begrunnelser
      )
    );
  });

  it(`viser feilmelding fra feilmeldingMap dersom mapping for feilkode finnes`, () => {
    const valideringsfeil = shallow(
      <Valideringsfeil
        feilkode={{ kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.OVERLAPPENDE_MEDL_PERIODER, felter: [] }}
      />
    );

    const feilbeskrivelse = valideringsfeil.find(Feilbeskrivelse);
    expect(feilbeskrivelse).toHaveLength(1);

    expect(feilbeskrivelse.props().tittel).toBe("Overlappende periode");
  });
});
