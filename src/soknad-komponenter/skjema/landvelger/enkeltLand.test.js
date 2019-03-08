import React from 'react';
import { EnkeltLand } from './enkeltLand';

describe('EnkeltLand', () => {
  let props = null;

  beforeEach(() => {
    props = {
      dataListID: '1',
      landkoder: [{ kode: 'test', term: 'test' }],
      meta: {},
      label: '',
      feil: '',
      input: {},
      disabled: false,
    };
  });

  it('viser en NAV Input', () => {
    const Enkeltland = shallow(<EnkeltLand {...props} />);
    expect(Enkeltland.find('Input')).toHaveLength(1);
  });

  it('sender value prop til NAV Input korrekt', () => {
    const Enkeltland = shallow(<EnkeltLand {...props} />);
    const event = { target: { value: 'test' } };

    Enkeltland.instance().inputEndringHandler(event);

    const Input = Enkeltland.find('Input');
    expect(Input.props().value).toBe('test');
  });
});
