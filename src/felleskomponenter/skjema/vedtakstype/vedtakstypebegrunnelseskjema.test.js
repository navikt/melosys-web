import React from 'react';

import * as Skjema from '../../../felleskomponenter/skjema';

import VedtakstypebegrunnelseSkjema from './vedtakstypebegrunnelseskjema';

describe('VedtakstypebegrunnelseSkjema', () => {
  describe('select', () => {
    let props = null;
    let select = null;

    beforeEach(() => {
      props = {
        className: 'artikkel',
        redigerbart: true,
        feltNavn: 'feltNavn',
        label: 'label',
      };
      const vedtakstypebegrunnelseSkjema = shallow(<VedtakstypebegrunnelseSkjema {...props} />);
      select = vedtakstypebegrunnelseSkjema.find(Skjema.Select);
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
      select = shallow(<VedtakstypebegrunnelseSkjema {...props} />).find(Skjema.Select);

      expect(select.props().disabled).toBe(true);
    });

    it('setter feltNavn', () => {
      expect(select.props().feltNavn).toBe(props.feltNavn);
    });

    it('setter label', () => {
      expect(select.props().label).toBe(props.label);
    });
  });
});
