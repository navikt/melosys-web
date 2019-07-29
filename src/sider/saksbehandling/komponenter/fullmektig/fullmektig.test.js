import React from 'react';

import { FullmektigPanel } from './fullmektigPanel';
import Fullmektig from './fullmektig';
import SokFullmektigOrg from './sokFullmektigOrg';

describe('SokFullmektigOrg', () => {
  let props = null;

  beforeEach(() => {
    props = {
      lagreNyFullmektigOgOppdaterLokalt: jest.fn(),
    };
  });

  it('viser en input', () => {
    const komponent = shallow(<SokFullmektigOrg {...props} />);
    expect(komponent.find('Input')).toHaveLength(1);
  });

  it('viser en knapp', () => {
    const komponent = shallow(<SokFullmektigOrg {...props} />);
    expect(komponent.find('Knapp')).toHaveLength(1);
  });

  it.skip('ved klikk på knapp kalles lagreFullmektigOgOppdaterLokalt-prop', () => {
    const komponent = shallow(<SokFullmektigOrg {...props} />);
    komponent.find('Input').simulate('change', { target: { value: 810072512 } });
    komponent.find('Knapp').simulate('click');
    expect(props.lagreNyFullmektigOgOppdaterLokalt).toHaveBeenCalled();
  });
});

describe('Fullmektig', () => {
  let props = null;

  beforeEach(() => {
    props = {
      fullmektig: { orgnr: 810072512, representererKode: 'BRUKER' },
      lagreFullmektig: jest.fn(),
      redigerbart: true,
      databaseID: 123456789,
      slettAktoer: jest.fn(() => Promise.resolve()),
      slettFullmektigLokalt: jest.fn(),
      lagreNyFullmektigOgOppdaterLokalt: jest.fn(),
      hentOrg: jest.fn(),
    };
  });

  it('viser en input dersom org ikke er satt', () => {
    const komponent = shallow(<Fullmektig {...props} />);
    expect(komponent.find('SokFullmektigOrg')).toHaveLength(1);
  });

  it.skip('viser et fieldset', () => {
    const komponent = shallow(<Fullmektig {...props} />);
    expect(komponent.find('Fieldset')).toHaveLength(1);
  });

  describe('fieldset', () => {
    it.skip('setter disabled-prop korrekt', () => {
      props.redigerbart = false;
      const komponent = shallow(<Fullmektig {...props} />);
      expect(komponent.find('Fieldset').props().disabled).toBeTruthy();
    });
  });

  it.skip('viser tre radioknapper', () => {
    const komponent = shallow(<Fullmektig {...props} />);
    expect(komponent.find('Radio')).toHaveLength(3);
  });

  it('viser en knapp for å slette fullmektig', () => {
    const komponent = shallow(<Fullmektig {...props} />);
    expect(komponent.find('Knapp')).toHaveLength(1);
  });
});

describe('FullmektigPanel', () => {
  let props = null;

  beforeEach(() => {
    props = {
      hentOrg: jest.fn(),
      hentAktoer: jest.fn(() => [{ databaseID: 1234 }, { databaseID: 4321 }]),
      slettAktoer: jest.fn(),
      oppsummering: { saksnummer: 4 },
      lagreAktoer: jest.fn(),
      redigerbart: true,
    };
  });

  it('viser en knapp for å legge til fullmektig', () => {
    const komponent = shallow(<FullmektigPanel {...props} />);
    expect(komponent.find('Knapp')).toHaveLength(1);
  });

  describe('knapp for å legge til fullmektig', () => {
    it('ved klikk vises en ny fullmektig komponent med korrekte props', () => {
      const komponent = shallow(<FullmektigPanel {...props} />);
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
