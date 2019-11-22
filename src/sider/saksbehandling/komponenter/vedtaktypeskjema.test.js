import React from 'react';
import * as MKV from 'melosys-kodeverk';

import * as Skjema from '../../../felleskomponenter/skjema';

import VedtaktypeSkjema from './vedtaktypeskjema';

describe('Vedtaketypeskjema', () => {
  describe('radiogruppe', () => {
    const props = {
      className: 'artikkel',
      redigerbart: true,
    };

    const vedtaktypeSkjema = shallow(<VedtaktypeSkjema {...props} />);
    const radiogruppe = vedtaktypeSkjema.find(Skjema.RadioGruppe);

    it('vises', () => {
      expect(radiogruppe).toHaveLength(1);
    });

    it('setter className', () => {
      expect(radiogruppe.props().className).toBe(props.className);
    });
  });

  describe('radioknapper', () => {
    let props = null;
    let vedtaktypeSkjema = null;
    let radioknapper = null;

    beforeEach(() => {
      props = {
        className: 'artikkel',
        redigerbart: true,
      };
      vedtaktypeSkjema = shallow(<VedtaktypeSkjema {...props} />);
      radioknapper = vedtaktypeSkjema.find(Skjema.Radio);
    });

    it('viser 2', () => {
      expect(radioknapper).toHaveLength(2);
    });

    describe('sin disabled', () => {
      it('settes av redigerbart for korrigeringsvedtak', () => {
        expect(radioknapper.find({ value: MKV.Koder.vedtakstyper.KORRIGERT_VEDTAK }).props().disabled).toBe(false);

        vedtaktypeSkjema = shallow(<VedtaktypeSkjema {...props} redigerbart={false} />);
        radioknapper = vedtaktypeSkjema.find(Skjema.Radio);
        expect(radioknapper.find({ value: MKV.Koder.vedtakstyper.KORRIGERT_VEDTAK }).props().disabled).toBe(true);
      });

      it('er disabled for omgjøringsvedtak', () => {
        expect(radioknapper.find({ value: MKV.Koder.vedtakstyper.OMGJØRINGSVEDTAK }).props().disabled).toBe(true);
      });
    });
  });
});
