import React from 'react';
import { EnkeltLand } from './enkeltLand';

describe('EnkeltLand', () => {
  let props = null;

  beforeEach(() => {
    props = {
      dataListID: '1',
      landkoder: [{ kode: 'NO', term: 'Norge' }, { kode: 'SE', term: 'Sverige' }],
      meta: {},
      label: '',
      feil: undefined,
      input: { onChange: () => null },
      disabled: false,
    };
  });


  it('viser en NAV Input med riktige props', () => {
    props.disabled = true;
    props.dataListID = '999';
    props.label = 'label';

    const enkeltLand = shallow(<EnkeltLand {...props} />);
    const input = enkeltLand.find('Input');
    expect(input).toHaveLength(1);

    expect(input.props().disabled).toBe(props.disabled);
    expect(input.props().label).toBe(props.label);
  });

  it('sender value prop til NAV Input korrekt når tekst endres', () => {
    const enkeltLand = shallow(<EnkeltLand {...props} />);
    const event = { target: { value: 'test' } };

    enkeltLand.find('Input').simulate('change', event);

    expect(enkeltLand.find('Input').props().value).toBe('test');
  });

  describe('ved fokus flyttet fra input', () => {
    it('hvis tekst er skrevet inn men landkoder prop mangler, lag feilmelding', () => {
      props.landkoder = [];
      const enkeltLand = shallow(<EnkeltLand {...props} />);
      const input = enkeltLand.find('Input');

      input.simulate('change', { target: { value: 'test' } });
      input.simulate('blur');

      expect(enkeltLand.find('Input').props().feil).toBeTruthy();
    });

    it('hvis tekst er skrevet inn og landkoder prop er oppgitt, oppdater input-verdi', () => {
      props.landkoder = [{ kode: 'NO', term: 'Norge' }, { kode: 'SE', term: 'Sverige' }];
      const enkeltLand = shallow(<EnkeltLand {...props} />);
      const input = enkeltLand.find('Input');

      input.simulate('change', { target: { value: 'NO' } });
      input.simulate('blur');

      expect(enkeltLand.find('Input').props().feil).toBeFalsy();
      expect(enkeltLand.find('Input').props().value).toBe('Norge (NO)');
    });

    it('hvis tekst ikke er skrevet inn, ikke vis feilmelding', () => {
      const enkeltLand = shallow(<EnkeltLand {...props} />);
      const input = enkeltLand.find('Input');

      input.simulate('blur');

      expect(enkeltLand.find('Input').props().feil).toBeFalsy();
    });
  });

  describe('ved tastetrykk', () => {
    it('dersom tasten er Enter, kall preventDefault', () => {
      const enkeltLand = shallow(<EnkeltLand {...props} />);
      const input = enkeltLand.find('Input');

      const event = { keyCode: 13, preventDefault: jest.fn() };
      input.simulate('keyDown', event);

      expect(event.preventDefault).toHaveBeenCalled();
    });
  });
});
