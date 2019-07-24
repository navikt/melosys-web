import React from 'react';

import Input, { InnerInputComponent } from './input';

import { normaliserInputDato } from '../../../utils/dato';

describe('Input', () => {
  let props = null;

  beforeEach(() => {
    props = {
      bredde: 'M',
      feltNavn: '',
      datoFelt: false,
    };
  });

  it('viser en redux form Field komponent', () => {
    const input = shallow(<Input {...props} />);

    expect(input.find('Field')).toHaveLength(1);
  });

  it('sender bredde prop korrekt', () => {
    props.bredde = 'test';
    const input = shallow(<Input {...props} />);

    expect(input.props().bredde).toBe(props.bredde);
  });
  it('sender feltNavn prop korrekt', () => {
    props.feltNavn = 'test';
    const input = shallow(<Input {...props} />);

    expect(input.props().name).toBe(props.feltNavn);
  });

  describe('datofelt prop', () => {
    it('setter normalize og placeholder props korrekt', () => {
      props.datoFelt = true;
      let input = shallow(<Input {...props} />);

      expect(input.props().normalize).toBe(normaliserInputDato);
      expect(input.props().placeholder).toBe('ddmmåå');

      props.datoFelt = false;
      input = shallow(<Input {...props} />);

      expect(input.props().normalize).toBe(null);
      expect(input.props().placeholder).toBe(null);
    });
  });
});

describe('InnerInputComponent', () => {
  let props = null;

  beforeEach(() => {
    props = {
      label: '',
      bredde: 'M',
      meta: {
        error: '',
        touched: false,
        active: true,
      },
      input: {},
      feltFeil: {},
      feltNavn: 'navn',
    };
  });

  it('viser en Nav Input', () => {
    const innerInputComponent = shallow(<InnerInputComponent {...props} />);

    expect(innerInputComponent.find('Input')).toHaveLength(1);
  });

  it('sender label prop korrekt', () => {
    props.label = 'testlabel';
    const innerInputComponent = shallow(<InnerInputComponent {...props} />);

    expect(innerInputComponent.find('Input').props().label).toBe(props.label);
  });

  describe('viser feilmelding', () => {
    it('dersom meta.error inneholder feilmelding, meta.touched er true og meta.activ er false', () => {
      props.meta = {
        error: 'feilmelding',
        touched: true,
        active: false,
      };
      const innerInputComponent = shallow(<InnerInputComponent {...props} />);

      expect(innerInputComponent.find('Input').props().feil.feilmelding).toBe(props.meta.error);
    });
  });

  describe('viser ikke feilmelding', () => {
    it('dersom meta.error ikke inneholder feilmelding', () => {
      props.meta = {
        error: '',
        touched: true,
        active: false,
      };
      const innerInputComponent = shallow(<InnerInputComponent {...props} />);

      expect(innerInputComponent.find('Input').props().feil).toBeUndefined();
    });

    it('dersom meta.touched er false', () => {
      props.meta = {
        error: 'feilmelding',
        touched: false,
        active: false,
      };
      const innerInputComponent = shallow(<InnerInputComponent {...props} />);

      expect(innerInputComponent.find('Input').props().feil).toBeUndefined();
    });

    it('dersom meta.active er true', () => {
      props.meta = {
        error: 'feilmelding',
        touched: true,
        active: true,
      };
      const innerInputComponent = shallow(<InnerInputComponent {...props} />);

      expect(innerInputComponent.find('Input').props().feil).toBeUndefined();
    });
  });
});
