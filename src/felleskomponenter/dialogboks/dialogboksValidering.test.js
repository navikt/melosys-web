import React from 'react';

import * as Nav from '../../utils/navFrontend';
import * as KV from '../../kodeverk';

import DialogboksValidering from './dialogboksValidering';
import MKV from '../../melosyskodeverk';

describe('DialogboksValidering', () => {
  let props = null;

  beforeEach(() => {
    props = {
      avbryt: jest.fn(),
      ariaHideApp: false,
      valideringer: [
        MKV.Koder.begrunnelser.kontroll_begrunnelser.OVERLAPPENDE_MEDL_PERIODER,
        MKV.Koder.begrunnelser.kontroll_begrunnelser.TREDJELANDSBORGER_IKKE_AVTALELAND,
      ],
    };
  });

  it('Viser en modal', () => {
    const dialogboksValidering = shallow(<DialogboksValidering {...props} />);

    expect(dialogboksValidering.find(Nav.Modal)).toHaveLength(1);
  });

  it('Viser en liste over valideringer', () => {
    const dialogboksValidering = shallow(<DialogboksValidering {...props} />);
    const valideringer = dialogboksValidering.find('div');

    expect(valideringer).toHaveLength(2);
  });

  it('Viser feilmelding "Ukjent feil" dersom det ikke finnes en mapping for feilkode', () => {
    props.valideringer = ['tilfeldigString'];
    const dialogboksValidering = shallow(<DialogboksValidering {...props} />);
    const valideringer = dialogboksValidering.find('div');

    expect(valideringer).toHaveLength(1);
    expect(valideringer.find(Nav.typo.Element).first().children().text()).toBe('Ukjent feil');
  });

  it('viser feilmelding fra kodeverk dersom ingen mapping for feilmelding finnes', () => {
    props.valideringer = [
      MKV.Koder.begrunnelser.kontroll_begrunnelser.MANGLENDE_BOSTEDSADRESSE,
    ];
    const dialogboksValidering = shallow(<DialogboksValidering {...props} />);

    const valideringer = dialogboksValidering.find('div');
    expect(valideringer).toHaveLength(1);

    const elementer = valideringer.find(Nav.typo.Element);
    const tekstomrader = valideringer.find(Nav.Tekstomrade);

    expect(elementer.first().children().text()).toBe('Feil ved kontroll');
    expect(tekstomrader.first().children().text()).toBe(KV.kodeTilTerm(
      MKV.Koder.begrunnelser.kontroll_begrunnelser.MANGLENDE_BOSTEDSADRESSE,
      MKV.KTObjects.begrunnelser.kontroll_begrunnelser
    ));
  });
});
