import React from 'react';

import * as Nav from '../../utils/navFrontend';

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
});
