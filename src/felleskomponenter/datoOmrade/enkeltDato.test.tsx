import React from 'react';
import EnkeltDato from './enkeltDato';
import { shallow } from 'enzyme';

describe('EnkeltDato', () => {
  const props = {
    dato: '2016-12-31',
    visTidspunkt: true,
  };

  it('viser en dato med klokkeslett dersom dato er oppgitt og vistidspunkt er true', () => {
    const enkeltDato = shallow(<EnkeltDato {...props} />);
    const time = enkeltDato.find('time');

    expect(time).toHaveLength(1);
    expect(time.children().text()).toBe('31.12.2016 01:00');
  });

  it('viser en dato uten klokkeslett dersom dato er oppgitt og vistidspunkt er false', () => {
    props.visTidspunkt = false;
    const enkeltDato = shallow(<EnkeltDato {...props} />);
    const time = enkeltDato.find('time');

    expect(time).toHaveLength(1);
    expect(time.children().text()).toBe('31.12.2016');
  });

  it('viser bindestrek dersom dato ikke er oppgitt', () => {
    props.dato = null;
    const enkeltDato = shallow(<EnkeltDato {...props} />);

    expect(enkeltDato.children().text()).toBe('-');
  });
});
