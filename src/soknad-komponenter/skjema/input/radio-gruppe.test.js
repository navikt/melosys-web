import React from 'react';

import RadioGruppe, { RadioGruppeWrappedComponent } from './radio-gruppe';

describe('RadioGruppe', () => {
  let props = null;

  beforeEach(() => {
    props = {
      feltNavn: '',
      legend: '',
      label: '',
    };
  });

  it('viser en redux form Field komponent med korrekte props', () => {
    props.children = 'children';
    props.feltNavn = 'feltnavn';
    props.legend = 'legend';
    props.label = 'label';
    const radioGruppe = shallow(<RadioGruppe {...props} />);
    const fieldProps = radioGruppe.find('Field').props();

    expect(fieldProps.name).toBe(props.feltNavn);
    expect(fieldProps.props.feltNavn).toBe(props.feltNavn);
    expect(fieldProps.props.label).toBe(props.label);
    expect(fieldProps.props.legend).toBe(props.legend);
    expect(fieldProps.props.children).toBe(props.children);
  });
});

describe('RadioGruppeWrappedComponent', () => {
  let props = null;

  beforeEach(() => {
    props = {
      feltNavn: '',
      children: '',
      meta: {},
      legend: '',
      label: '',
    };
  });

  it('viser et Nav Fieldset', () => {
    const radioGruppeWrappedComponent = shallow(<RadioGruppeWrappedComponent {...props} />);

    expect(radioGruppeWrappedComponent.find('Fieldset')).toHaveLength(1);
  });

  it('viser en label', () => {
    const radioGruppeWrappedComponent = shallow(<RadioGruppeWrappedComponent {...props} />);

    expect(radioGruppeWrappedComponent.find('label')).toHaveLength(1);
  });
});
