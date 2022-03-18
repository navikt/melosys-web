import { shallow } from "enzyme";
import React from "react";

import * as KV from "../../../kodeverk";
import MKV from "../../../melosyskodeverk";
import Valideringsfeil, { ValideringBody } from "./Valideringsfeil";

describe("Valideringsfeil", () => {
  it('Viser feilmelding "Ukjent feil" dersom det ikke finnes en mapping for feilkode', () => {
    const valideringsfeil = shallow(<Valideringsfeil validering={{ kode: "tilfeldigString", felter: [] }} />);
    const valideringBody = valideringsfeil.find(ValideringBody);

    expect(valideringBody).toHaveLength(1);
    expect(valideringBody.props().tittel).toBe("Ukjent feil");
  });

  it("viser feilmelding fra kodeverk dersom ingen mapping for feilmelding finnes, og kontrollkode stammer fra manglende utfylling av felter", () => {
    const valideringsfeil = shallow(
      <Valideringsfeil
        validering={{ kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.MANGLENDE_BOSTEDSADRESSE, felter: [] }}
      />
    );

    const valideringBody = valideringsfeil.find(ValideringBody);
    expect(valideringBody).toHaveLength(1);

    expect(valideringBody.props().tittel).toBe("Manglende utfylling");
    expect(valideringBody.props().innhold).toBe(
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

    const valideringBody = valideringsfeil.find(ValideringBody);
    expect(valideringBody).toHaveLength(1);

    expect(valideringBody.props().tittel).toBe("Feil ved kontroll");
    expect(valideringBody.props().innhold).toBe(
      KV.kodeTilTerm(
        MKV.Koder.begrunnelser.kontroll_begrunnelser.INGEN_SLUTTDATO,
        MKV.KTObjects.begrunnelser.kontroll_begrunnelser
      )
    );
  });
});
