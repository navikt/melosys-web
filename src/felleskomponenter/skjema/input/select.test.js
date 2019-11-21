import React from 'react';

import Select, { SelectWrappedComponent } from './select';

describe('Select', () => {
  let props = null;

  beforeEach(() => {
    props = {
      feltNavn: '',
      id: '1',
      className: '',
    };
  });

  it('viser en redux form Field komponent med korrekte props', () => {
    props.feltNavn = 'feltnavn';
    props.id = '1234';
    props.className = 'class name';
    const select = shallow(<Select {...props} />);
    const field = select.find('Field');

    expect(field).toHaveLength(1);
    expect(field.props().name).toBe(props.feltNavn);
    expect(field.props().id).toBe(props.id);
    expect(field.props().className).toBe(props.className);
  });
});

describe('SelectWrappedComponent', () => {
  let props = null;

  beforeEach(() => {
    props = {
      label: '',
      input: {},
      meta: {},
    };
  });

  it('viser en Nav Select', () => {
    const selectWrappedComponent = shallow(<SelectWrappedComponent {...props} />);
    expect(selectWrappedComponent.find('Select')).toHaveLength(1);
  });

  it('sender label prop til Nav Select', () => {
    props.label = 'label tekst';
    const selectWrappedComponent = shallow(<SelectWrappedComponent {...props} />);

    expect(selectWrappedComponent.find('Select').props().label).toBe(props.label);
  });

  it('setter feil-prop dersom meta.error prop finnes', () => {
    props.meta.touched = true;
    props.meta.active = false;
    props.meta.error = 'err';
    const selectWrappedComponent = shallow(<SelectWrappedComponent {...props} />);

    expect(selectWrappedComponent.find('Select').props().feil.feilmelding).toBe(props.meta.error);
  });

  it('setter ikke feil-prop dersom meta.error prop ikke finnes', () => {
    props.meta.error = null;
    const selectWrappedComponent = shallow(<SelectWrappedComponent {...props} />);

    expect(selectWrappedComponent.find('Select').props().feil).toBeUndefined();
  });

  it('sender children-prop til Nav Select sin children-prop', () => {
    props.children = 'children';
    const selectWrappedComponent = shallow(<SelectWrappedComponent {...props} />);

    expect(selectWrappedComponent.find('Select').props().children).toContain(props.children);
  });
});
