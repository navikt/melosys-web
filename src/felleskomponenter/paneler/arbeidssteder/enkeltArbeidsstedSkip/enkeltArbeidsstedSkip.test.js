import React from 'react';

import * as Skjema from '../../../skjema';

import EnkeltArbeidsstedSkip from './enkeltArbeidsstedSkip';

import MKV from '../../../../melosyskodeverk';

describe('EnkeltArbeidsstedSkip', () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
      overordnetFeltNavn: 'foretakUtland[0]',
      verdier: {},
      settVerdi: jest.fn(),
    };
  });

  describe('alle inputs', () => {
    it('har disabled satt basert på redigerbart', () => {
      const enkeltArbeidsstedSkip = shallow(<EnkeltArbeidsstedSkip {...props} />);

      const inputs = enkeltArbeidsstedSkip.find(Skjema.Input);

      inputs.forEach(n => {
        expect(n.props().disabled).toBe(!props.redigerbart);
      });
    });
  });

  it('viser Landvelger for territorialfarvann hvis fartsområde er innenriks', () => {
    props.verdier = { fartsomradeKode: MKV.Koder.begrunnelser.fartsomrader.INNENRIKS };
    const enkeltArbeidsstedSkip = shallow(<EnkeltArbeidsstedSkip {...props} />);

    const landvelger = enkeltArbeidsstedSkip.find(Skjema.LandVelger);

    expect(landvelger).toHaveLength(1);
    expect(landvelger.props().label).toBe('Territorialfarvannsland');
  });

  it('viser Landvelger for flaggland hvis fartsområde er utenriks', () => {
    props.verdier = { fartsomradeKode: MKV.Koder.begrunnelser.fartsomrader.UTENRIKS };
    const enkeltArbeidsstedSkip = shallow(<EnkeltArbeidsstedSkip {...props} />);

    const landvelger = enkeltArbeidsstedSkip.find(Skjema.LandVelger);

    expect(landvelger).toHaveLength(1);
    expect(landvelger.props().label).toBe('Flaggland');
  });

  it('setter felt for territorialfarvann til null hvis fartsområde endres til utenriks', () => {
    const enkeltArbeidsstedSkip = shallow(<EnkeltArbeidsstedSkip {...props} />);
    const fartsomrade = enkeltArbeidsstedSkip.find(Skjema.Select);

    const event = { target: { value: MKV.Koder.begrunnelser.fartsomrader.UTENRIKS } };

    fartsomrade.simulate('change', event);

    expect(props.settVerdi).toHaveBeenCalledTimes(1);
    expect(props.settVerdi).toHaveBeenLastCalledWith('territorialfarvann', null);
  });

  it('setter felt for flaggland til null hvis fartsområde endres til innenriks', () => {
    const enkeltArbeidsstedSkip = shallow(<EnkeltArbeidsstedSkip {...props} />);
    const fartsomrade = enkeltArbeidsstedSkip.find(Skjema.Select);

    const event = { target: { value: MKV.Koder.begrunnelser.fartsomrader.INNENRIKS } };

    fartsomrade.simulate('change', event);

    expect(props.settVerdi).toHaveBeenCalledTimes(1);
    expect(props.settVerdi).toHaveBeenLastCalledWith('flaggLandkode', null);
  });
});
