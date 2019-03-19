import React from 'react';
import Landvelger from './LandVelger';

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
      const landVelger = shallow(<Landvelger {...props} />);
      expect(landVelger.find('EnkeltLandWrapper')).toHaveLength(1);
      expect(landVelger.find('MultiLandWrapper')).toHaveLength(0);
    });
  });

  describe('Dersom multiland prop er true', () => {
    it('viser multiland og ikke enkeltland', () => {
      props.multiLand = true;
      const landVelger = shallow(<Landvelger {...props} />);
      expect(landVelger.find('EnkeltLandWrapper')).toHaveLength(0);
      expect(landVelger.find('MultiLandWrapper')).toHaveLength(1);
    });
  });

  it('viser en datalist', () => {
    const landVelger = shallow(<Landvelger {...props} />);
    expect(landVelger.find('datalist')).toHaveLength(1);
  });
});
