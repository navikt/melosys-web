import React from 'react';

import LinksBuilder from './linksBuilder';

describe('LinksBuilder', () => {
  it('setter labels korrekt', () => {
    const props = {
      visArbeidsforholdRolleEtiketter: true,
      redigerbart: true,
      behandlingsgrunnlagEtikett: <span />,
      visBehandlingsgrunnlagData: true,
      lagreSoknadOgOppfriskSaksopplysninger: jest.fn(),
    };

    const linksBuilder = new LinksBuilder(props);

    const links = linksBuilder
      .addArbeidsforholdOgInntekt()
      .addArbeidsgiverEllervirksomhet()
      .addArbeidssteder()
      .addEUEOSBarnetrygd()
      .addFamilieForhold()
      .addFullmektig()
      .addMedlemskap()
      .addPeriode()
      .addPerson()
      .build();

    expect(links[0].label).toBe('Arbeidsforhold og inntekt');
    expect(links[1].label).toBe('Arbeidsgiver/virksomhet');
    expect(links[2].label).toBe('Arbeidssted(er)');
    expect(links[3].label).toBe('EU/EØS-barnetrygd');
    expect(links[4].label).toBe('Familieforhold');
    expect(links[5].label).toBe('Fullmektig');
    expect(links[6].label).toBe('Medlemskap');
    expect(links[7].label).toBe('Periode');
    expect(links[8].label).toBe('Person');
  });
});
