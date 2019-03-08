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
      feil: '',
      input: { onChange: jest.fn() },
      disabled: false,
    };
  });

  it('viser en NAV Input', () => {
    const enkeltLand = shallow(<EnkeltLand {...props} />);
    expect(enkeltLand.find('Input')).toHaveLength(1);
  });

  it('sender value prop til NAV Input korrekt', () => {
    const enkeltLand = shallow(<EnkeltLand {...props} />);
    const event = { target: { value: 'test' } };

    enkeltLand.instance().inputEndringHandler(event);

    const Input = enkeltLand.find('Input');
    expect(Input.props().value).toBe('test');
  });

  it('inputEndringHandler', () => {
    const enkeltLandInstance = shallow(<EnkeltLand {...props} />).instance();
    enkeltLandInstance.reduxFjernLand = jest.fn();
    enkeltLandInstance.tomFeilmelding = jest.fn();
    enkeltLandInstance.finnEttLand = jest.fn(() => ({ kode: 'test' }));
    enkeltLandInstance.reduxOppdaterLand = jest.fn();

    enkeltLandInstance.fokusUtHandler();

    expect(enkeltLandInstance.reduxFjernLand).toHaveBeenCalledTimes(1);
    expect(enkeltLandInstance.tomFeilmelding).toHaveBeenCalledTimes(1);

    const event = { target: { value: 'test' } };
    enkeltLandInstance.inputEndringHandler(event);

    enkeltLandInstance.fokusUtHandler();

    expect(enkeltLandInstance.finnEttLand).toHaveBeenCalledTimes(1);
    expect(enkeltLandInstance.finnEttLand).toHaveBeenLastCalledWith(event.target.value);
    expect(enkeltLandInstance.reduxOppdaterLand).toHaveBeenCalledTimes(1);
    expect(enkeltLandInstance.reduxOppdaterLand).toHaveBeenLastCalledWith('test');
  });

  it('inputTestNedHandler', () => {
    const enkeltLandInstance = shallow(<EnkeltLand {...props} />).instance();
    enkeltLandInstance.fokusUtHandler = jest.fn();
    const event = { keyCode: 0, preventDefault: jest.fn() };

    enkeltLandInstance.inputTastNedHandler(event);

    expect(enkeltLandInstance.fokusUtHandler).toHaveBeenCalledTimes(0);
    expect(event.preventDefault).toHaveBeenCalledTimes(0);

    event.keyCode = 13;

    enkeltLandInstance.inputTastNedHandler(event);

    expect(enkeltLandInstance.fokusUtHandler).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('reduxOppdaterLand', () => {
    const enkeltLandInstance = shallow(<EnkeltLand {...props} />).instance();

    expect(() => enkeltLandInstance.reduxOppdaterLand(null)).toThrow();

    enkeltLandInstance.reduxOppdaterLand('Norge');

    expect(props.input.onChange).toHaveBeenCalledTimes(1);
    expect(props.input.onChange).toHaveBeenCalledWith('Norge');
  });

  it('reduxFjernLand', () => {
    const enkeltLandInstance = shallow(<EnkeltLand {...props} />).instance();

    enkeltLandInstance.reduxFjernLand();

    expect(props.input.onChange).toHaveBeenCalledTimes(1);
    expect(props.input.onChange).toHaveBeenCalledWith('');
  });

  it('fokusInnHandler', () => {
    const enkeltLandInstance = shallow(<EnkeltLand {...props} />).instance();
    const event = { target: { select: jest.fn() } };

    enkeltLandInstance.fokusInnHandler(event);

    expect(event.target.select).toHaveBeenCalledTimes(1);
  });

  // it('finnFlereLand', () => {
  //   const enkeltLandInstance = shallow(<EnkeltLand {...props} />).instance();
  //
  //   expect(enkeltLandInstance.finnFlereLand(null)).toEqual([]);
  //
  //   expect(enkeltLandInstance.finnFlereLand())
  // });
});
