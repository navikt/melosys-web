import React from 'react';
import EnkeltLandPure from './enkeltLandPure';


describe('EnkeltLandPure', () => {
  let props = null;

  beforeEach(() => {
    props = {
      landkoder: [{ kode: 'NO', term: 'Norge' }, { kode: 'SE', term: 'Sverige' }],
      value: 'verdi',
      onChange: jest.fn(),
    };
  });

  it('viser en nav input med riktige props', () => {
    props.value = 'NO';
    props.label = 'label';
    props.bredde = 'fullbredde';
    const enkeltLandPure = shallow(<EnkeltLandPure {...props} />);
    const input = enkeltLandPure.find('Input');

    expect(input.props().value).toBe('Norge (NO)');
    expect(input.props().label).toBe(props.label);
    expect(input.props().bredde).toBe(props.bredde);
  });

  describe('ved endring av tekst', () => {
    it('sendes tekst som value prop til nav input-komponent', () => {
      const enkeltLandPure = shallow(<EnkeltLandPure {...props} />);
      const event = { target: { value: 'Verdi' } };
      const input = enkeltLandPure.find('Input');

      input.simulate('change', event);

      expect(enkeltLandPure.find('Input').props().value).toBe(event.target.value);
    });
  });

  describe('ved tastetrykk', () => {
    it('dersom tasten er enter, kaller preventDefault', () => {
      const enkeltLandPure = shallow(<EnkeltLandPure {...props} />);
      const event = { keyCode: 13, preventDefault: jest.fn() };
      const input = enkeltLandPure.find('Input');

      input.simulate('keyDown', event);

      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('ved fokus på input', () => {
    it('kall event.target.select', () => {
      const enkeltLandPure = shallow(<EnkeltLandPure {...props} />);
      const event = { target: { select: jest.fn() } };
      const input = enkeltLandPure.find('Input');

      input.simulate('focus', event);

      expect(event.target.select).toHaveBeenCalled();
    });
  });

  describe('ved fokus flyttet fra input', () => {
    it('hvis tekst ikke er skrevet inn, ikke vis feilmelding', () => {
      const enkeltLandPure = shallow(<EnkeltLandPure {...props} />);
      const input = enkeltLandPure.find('Input');

      input.simulate('blur');

      expect(enkeltLandPure.find('Input').props().feil).toBeFalsy();
    });

    it('hvis tekst er skrevet inn men landkoder prop ikke er oppgitt, vis feilmelding', () => {
      props.landkoder = [];
      const enkeltLandPure = shallow(<EnkeltLandPure {...props} />);
      const event = { target: { value: 'NO' } };
      const input = enkeltLandPure.find('Input');

      input.simulate('change', event);
      input.simulate('blur');

      expect(enkeltLandPure.find('Input').props().feil).toBeTruthy();
    });

    it('hvis tekst er skrevet inn og landkoder prop er oppgitt, oppdater inputverdi', () => {
      const enkeltLandPure = shallow(<EnkeltLandPure {...props} />);
      const event = { target: { value: 'NO' } };
      const input = enkeltLandPure.find('Input');

      input.simulate('change', event);
      input.simulate('blur');

      expect(enkeltLandPure.find('Input').props().value).toBe('Norge (NO)');
    });
  });
});
