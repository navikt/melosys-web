import React from 'react';

import Fullmektig from './fullmektig';

describe('Fullmektig', () => {
  let props = null;

  beforeEach(() => {
    props = {
      fullmektig: { orgnr: 810072512, representererKode: 'BRUKER' },
      lagreFullmektig: jest.fn(),
      redigerbart: true,
      databaseID: 123456789,
      slettFullmektig: jest.fn(),
      lagreNyFullmektigOgOppdaterLokalt: jest.fn(),
      hentOrg: jest.fn(),
      index: 1,
      settRepresentant: jest.fn(),
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
