import { shallow } from "enzyme";
import React from "react";

import * as KV from "../../../kodeverk";
import MKV from "../../../melosyskodeverk";
import Valideringsfeil, { Feilbeskrivelse } from "./Valideringsfeil";

describe("Valideringsfeil", () => {
  it('Viser feilmelding "Ukjent feil" dersom det ikke finnes en mapping for feilkode', () => {
    const valideringsfeil = shallow(<Valideringsfeil validering={{ kode: "tilfeldigString", felter: [] }} />);
    const feilbeskrivelse = valideringsfeil.find(Feilbeskrivelse);

    expect(feilbeskrivelse).toHaveLength(1);
    expect(feilbeskrivelse.props().tittel).toBe("Ukjent feil");
  });

  it("viser feilmelding fra kodeverk dersom ingen mapping for feilmelding finnes, og kontrollkode stammer fra manglende utfylling av felter", () => {
    const valideringsfeil = shallow(
      <Valideringsfeil
        validering={{ kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.MANGLENDE_BOSTEDSADRESSE, felter: [] }}
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

  it(`viser feilmelding fra kodeverk dersom ingen mapping for feilmelding finnes, og kontrollkode er ${MKV.Koder.begrunnelser.kontroll_begrunnelser.INGEN_SLUTTDATO}`, () => {
    const valideringsfeil = shallow(
      <Valideringsfeil
        validering={{ kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.INGEN_SLUTTDATO, felter: [] }}
      />
    );

    const feilbeskrivelse = valideringsfeil.find(Feilbeskrivelse);
    expect(feilbeskrivelse).toHaveLength(1);

    expect(feilbeskrivelse.props().tittel).toBe("Feil ved kontroll");
    expect(feilbeskrivelse.props().innhold).toBe(
      KV.kodeTilTerm(
        MKV.Koder.begrunnelser.kontroll_begrunnelser.INGEN_SLUTTDATO,
        MKV.KTObjects.begrunnelser.kontroll_begrunnelser
      )
    );
  });
});
