import React from 'react';

import * as Nav from '../../utils/navFrontend';
import * as KV from '../../kodeverk';

import DialogboksValidering, { Validering, Feilmelding, ModalBody } from './dialogboksValidering';
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
    const valideringer = dialogboksValidering.find(Validering);

    expect(valideringer).toHaveLength(2);
  });

  it('Viser en liste over feilmeldinger', () => {
    props.feilmeldinger = [
      { tittel: 'tittel1', innhold: 'innhold1' },
      { tittel: 'tittel2', innhold: 'innhold2' },
    ];

    const dialogboksValidering = shallow(<DialogboksValidering {...props} />);
    const feilmeldinger = dialogboksValidering.find(Feilmelding);

    expect(feilmeldinger).toHaveLength(2);
  });

  it('Viser feilmelding "Ukjent feil" dersom det ikke finnes en mapping for feilkode', () => {
    const validering = shallow(<Validering valideringKode="tilfeldingString" />);
    const modalBody = validering.find(ModalBody);

    expect(modalBody).toHaveLength(1);
    expect(modalBody.props().tittel).toBe('Ukjent feil');
  });

  it('viser feilmelding fra kodeverk dersom ingen mapping for feilmelding finnes', () => {
    const validering = shallow(<Validering valideringKode={MKV.Koder.begrunnelser.kontroll_begrunnelser.MANGLENDE_BOSTEDSADRESSE} />);

    const modalBody = validering.find(ModalBody);
    expect(modalBody).toHaveLength(1);

    expect(modalBody.props().tittel).toBe('Feil ved kontroll');
    expect(modalBody.props().innhold).toBe(KV.kodeTilTerm(
      MKV.Koder.begrunnelser.kontroll_begrunnelser.MANGLENDE_BOSTEDSADRESSE,
      MKV.KTObjects.begrunnelser.kontroll_begrunnelser
    ));
  });
});
