import React from 'react';
import * as MKV from 'melosys-kodeverk';

import * as Skjema from '../../../felleskomponenter/skjema';

import VedtakstypeSkjema from './vedtakstypeskjema';

describe('Vedtaketypeskjema', () => {
  describe('radiogruppe', () => {
    const props = {
      className: 'artikkel',
      redigerbart: true,
      feltNavn: 'feltNavn',
      label: 'label',
    };

    const vedtakstypeSkjema = shallow(<VedtakstypeSkjema {...props} />);
    const radiogruppe = vedtakstypeSkjema.find(Skjema.RadioGruppe);

    it('vises', () => {
      expect(radiogruppe).toHaveLength(1);
    });

    it('setter className', () => {
      expect(radiogruppe.props().className).toBe(props.className);
    });

    it('setter label', () => {
      expect(radiogruppe.props().label).toBe(props.label);
    });

    it('setter feltNavn', () => {
      expect(radiogruppe.props().feltNavn).toBe(props.feltNavn);
    });
  });

  describe('radioknapper', () => {
    let props = null;
    let vedtakstypeSkjema = null;
    let radioknapper = null;

    beforeEach(() => {
      props = {
        className: 'artikkel',
        redigerbart: true,
        feltNavn: 'feltNavn',
        label: 'label',
      };
      vedtakstypeSkjema = shallow(<VedtakstypeSkjema {...props} />);
      radioknapper = vedtakstypeSkjema.find(Skjema.Radio);
    });

    it('viser 2', () => {
      expect(radioknapper).toHaveLength(2);
    });

    it('sin feltNavn settes', () => {
      radioknapper.forEach(radioKnapp => {
        expect(radioKnapp.props().feltNavn).toBe(props.feltNavn);
      });
    });

    describe('sin disabled', () => {
      it('settes av redigerbart for korrigeringsvedtak', () => {
        expect(radioknapper.find({ value: MKV.Koder.vedtakstyper.KORRIGERT_VEDTAK }).props().disabled).toBe(false);

        vedtakstypeSkjema = shallow(<VedtakstypeSkjema {...props} redigerbart={false} />);
        radioknapper = vedtakstypeSkjema.find(Skjema.Radio);
        expect(radioknapper.find({ value: MKV.Koder.vedtakstyper.KORRIGERT_VEDTAK }).props().disabled).toBe(true);
      });

      it('er disabled for omgjøringsvedtak', () => {
        expect(radioknapper.find({ value: MKV.Koder.vedtakstyper.OMGJØRINGSVEDTAK }).props().disabled).toBe(true);
      });
    });
  });
});
