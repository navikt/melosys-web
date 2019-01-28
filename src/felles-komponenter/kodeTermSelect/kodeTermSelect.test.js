import React from 'react';

import KodeTermSelect from './kodeTermSelect';

describe('KodeTermSelect', () => {
  let props = null;

  beforeEach(() => {
    props = {
      koder: [],
      value: '',
      onChange: jest.fn(),
      label: '',
      feil: undefined,
      disableFørsteValg: false,
      redigerbar: true,
    };
  });

  it('viser en Nav Select først', () => {
    const komponent = shallow(<KodeTermSelect {...props} />);
    expect(komponent.first().is('Select')).toBe(true);
  });

  describe('Nav Select', () => {
    it('har ett valg når koder prop er tom', () => {
      props.koder = [];
      const komponent = shallow(<KodeTermSelect {...props} />);
      expect(komponent.find('option')).toHaveLength(1);
    });

    it('mapper koder prop til valg i dropdownlist', () => {
      props.koder = [
        { kode: '', term: '' },
        { kode: '', term: '' },
      ];
      const komponent = shallow(<KodeTermSelect {...props} />);
      expect(komponent.find('option')).toHaveLength(3);
    });

    it('setter disabled til det motsatte av redigerbar prop', () => {
      props.redigerbar = true;
      let komponent = shallow(<KodeTermSelect {...props} />);
      expect(komponent.props().disabled).toBe(false);

      props.redigerbar = false;
      komponent = shallow(<KodeTermSelect {...props} />);
      expect(komponent.props().disabled).toBe(true);
    });

    describe('valg', () => {
      it('tekst er hentet fra term fra kode prop', () => {
        props.koder = [
          { kode: '', term: '' },
          { kode: '', term: 'testterm' },
        ];
        const komponent = shallow(<KodeTermSelect {...props} />);
        expect(komponent.find('option').last().text()).toBe('testterm');
      });
    });
  });
});
