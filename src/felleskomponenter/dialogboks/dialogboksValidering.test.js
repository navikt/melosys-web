import React from 'react';

import * as Nav from '../../utils/navFrontend';
import * as KV from '../../kodeverk';

import DialogboksValidering, { Validering, Feilmelding, ModalBody, VedtakValideringsfeil } from './dialogboksValidering';
import MKV from '../../melosyskodeverk';

describe('DialogboksValidering', () => {
  let props = null;

  beforeEach(() => {
    props = {
      avbryt: jest.fn(),
      ariaHideApp: false,
      vedtakValideringsfeil: [
        {
          kode: 'abc',
          felter: [],
        },
        {
          kode: 'def',
          felter: [],
        },
      ],
    };
  });

  it('Viser en modal', () => {
    const dialogboksValidering = shallow(<DialogboksValidering {...props} />);

    expect(dialogboksValidering.find(Nav.Modal)).toHaveLength(1);
  });

  it('Viser en liste over vedtakValideringsfeil', () => {
    const dialogboksValidering = shallow(<DialogboksValidering {...props} />);
    const vedtakValideringsfeil = dialogboksValidering.find(VedtakValideringsfeil);

    expect(vedtakValideringsfeil).toHaveLength(2);
    expect(vedtakValideringsfeil.first().props().feil).toBe(props.vedtakValideringsfeil[0]);
    expect(vedtakValideringsfeil.last().props().feil).toBe(props.vedtakValideringsfeil[1]);
  });

  it('Viser en liste over feilmeldinger for journalforingValideringerFeilmeldinger', () => {
    props.vedtakValideringsfeil = [];
    props.journalforingValideringerFeilmeldinger = [
      { tittel: 'tittel1', innhold: 'innhold1' },
      { tittel: 'tittel2', innhold: 'innhold2' },
    ];

    const dialogboksValidering = shallow(<DialogboksValidering {...props} />);
    const feilmeldinger = dialogboksValidering.find(Feilmelding);

    expect(feilmeldinger).toHaveLength(2);
  });
});

describe('Validering', () => {
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

describe('VedtakValideringsfeil', () => {
  let props = null;

  beforeEach(() => {
    props = {
      feil: {
        kode: 'abc',
        felter: ['1234', '5678'],
      },
    };
  });

  it('viser Validering', () => {
    const vedtakValideringsfeil = shallow(<VedtakValideringsfeil {...props} />);
    const validering = vedtakValideringsfeil.find(Validering);

    expect(validering).toHaveLength(1);
    expect(validering.props().valideringKode).toBe(props.feil.kode);
  });

  it('viser en liste over felter', () => {
    const vedtakValideringsfeil = shallow(<VedtakValideringsfeil {...props} />);
    const ul = vedtakValideringsfeil.find('ul');
    const li = vedtakValideringsfeil.find('li');

    expect(ul).toHaveLength(1);
    expect(li).toHaveLength(2);
    expect(li.first().text()).toBe(props.feil.felter[0]);
    expect(li.last().text()).toBe(props.feil.felter[1]);
  });
});
