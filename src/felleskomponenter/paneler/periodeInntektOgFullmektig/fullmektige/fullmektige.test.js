import React from 'react';

import { Fullmektige } from './fullmektige';

describe('Fullmektige', () => {
  let props = null;

  beforeEach(() => {
    props = {
      hentOrg: jest.fn(),
      hentAktoer: jest.fn(() => [{ databaseID: 1234 }, { databaseID: 4321 }]),
      slettAktoer: jest.fn(),
      oppsummering: { saksnummer: 4 },
      lagreAktoer: jest.fn(),
      redigerbart: true,
      fagsak: {
        saksnummer: '4',
        sakstype: {
          kode: 'SOKNAD',
          term: 'Søknad',
        },
        saksstatus: {
          kode: 'UNDER_BEHANDLING',
          term: 'Under behandling',
        },
        registrertDato: '01-01-2011',
        endretDato: '12-12-2012',
        gsakSaksnummer: 4,
        behandlingOversikter: [],
      },
    };
  });

  it('viser en knapp for å legge til fullmektig', () => {
    const komponent = shallow(<Fullmektige {...props} />);
    expect(komponent.find('Knapp')).toHaveLength(1);
  });

  describe('knapp for å legge til fullmektig', () => {
    it('ved klikk vises en ny fullmektig komponent med korrekte props', () => {
      const komponent = shallow(<Fullmektige {...props} />);
      expect(komponent.find('Fullmektig')).toHaveLength(0);
      komponent.find('Knapp').simulate('click');
      expect(komponent.find('Fullmektig')).toHaveLength(1);

      const fullmektig = komponent.find('Fullmektig');
      expect(fullmektig.props().hentOrg).toBe(props.hentOrg);
      expect(fullmektig.props().slettAktoer).toBe(props.slettAktoer);
      expect(fullmektig.props().redigerbart).toBe(props.redigerbart);
    });
  });
});
