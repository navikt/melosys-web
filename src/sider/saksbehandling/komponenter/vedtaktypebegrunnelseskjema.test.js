import React from 'react';

import * as Skjema from '../../../felleskomponenter/skjema';

import VedtaktypebegrunnelseSkjema from './vedtaktypebegrunnelseskjema';

describe('VedtaketypebegrunnelseSkjema', () => {
  describe('select', () => {
    let props = null;
    let select = null;

    beforeEach(() => {
      props = {
        className: 'artikkel',
        redigerbart: true,
      };
      const vedtaktypebegrunnelseSkjema = shallow(<VedtaktypebegrunnelseSkjema {...props} />);
      select = vedtaktypebegrunnelseSkjema.find(Skjema.Select);
    });

    it('vises', () => {
      expect(select).toHaveLength(1);
    });

    it('setter className', () => {
      expect(select.props().className).toBe(props.className);
    });

    it('setter disabled', () => {
      expect(select.props().disabled).toBe(false);

      props.redigerbart = false;
      select = shallow(<VedtaktypebegrunnelseSkjema {...props} />).find(Skjema.Select);

      expect(select.props().disabled).toBe(true);
    });
  });
});
