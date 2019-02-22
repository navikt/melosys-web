import React from 'react';
import Landvelger from './index';

describe(('Landvelger'), () => {
  let props = null;

  beforeEach(() => {
    props = {
      disabled: false,
      feltNavn: 'test',
      multiLand: false,
      label: 'test',
    };
  });


  describe('Dersom multiland prop er false', () => {
    it('viser enkeltland og ikke multiland', () => {
      props.multiLand = false;
      const LandVelger = shallow(<Landvelger {...props} />);
      expect(LandVelger.find('EnkeltLandWrapper')).toHaveLength(1);
      expect(LandVelger.find('MultiLandWrapper')).toHaveLength(0);
    });
  });

  describe('Dersom multiland prop er true', () => {
    it('viser multiland og ikke enkeltland', () => {
      props.multiLand = true;
      const LandVelger = shallow(<Landvelger {...props} />);
      expect(LandVelger.find('EnkeltLandWrapper')).toHaveLength(0);
      expect(LandVelger.find('MultiLandWrapper')).toHaveLength(1);
    });
  });

  it('viser en datalist', () => {
    const LandVelger = shallow(<Landvelger {...props} />);
    expect(LandVelger.find('datalist')).toHaveLength(1);
  });
});
