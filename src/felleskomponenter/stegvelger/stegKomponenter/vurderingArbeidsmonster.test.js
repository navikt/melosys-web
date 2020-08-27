import React from 'react';

import * as KV from '../../../kodeverk';
import * as Nav from '../../../utils/navFrontend';

import MKV from '../../../melosyskodeverk';
import { lagAvklartfakta } from '../../../regler/avklartefakta';

import { VurderingArbeidsmonster, LandLinje } from './vurderingArbeidsmonster';

describe('VurderingVurderarbeidsland', () => {
  let props = null;

  beforeEach(() => {
    props = {
      begrunnelser: [],
      bekreftOgFortsett: jest.fn(),
      tilstand: {
        harAvklaring: true,
        marginaltArbeid: [],
        aktivitetINorge: {},
        aktivitetINorgeNodvendig: true,
        yrkesaktivitet: '',
        erArbeidstakerOgSelvstendigNaeringsdrivende: true,
        erOffentligTjenestemann: true,
        loennetArbeidAntallLandFakta: {},
        offentligArbeidAntallLandFakta: {},
        landMedVesentligArbeid: [],
        erNorgeValgt: true,
      },
      redigerbart: true,
      oppdaterData: jest.fn(),
      slettData: jest.fn(),
      arbeidsland: [],
      resetForm: jest.fn(),
    };
  });

  it('viser Arbeidsmønstersteg uten å krasje', () => {
    shallow(<VurderingArbeidsmonster {...props} />);
  });
});

describe('LandLinje', () => {
  const props = {
    landKode: MKV.KTObjects.landkoder.find(({ kode }) => kode === MKV.Koder.landkoder.DE),
    avklartMarginaltArbeidILand: { fakta: ['TRUE'] },
    oppdaterData: jest.fn(),
    redigerbart: true,
    resetForm: jest.fn(),
  };

  describe('ved klikk på checkbox', () => {
    const landLinje = shallow(<LandLinje {...props} />);
    const checkbox = landLinje.find(Nav.Checkbox);
    checkbox.simulate('change');

    it('lagrer marginalt arbeid avklartfakta', () => {
      expect(props.oppdaterData).toHaveBeenCalledTimes(1);
      expect(props.oppdaterData).toHaveBeenLastCalledWith(lagAvklartfakta(
        MKV.Koder.avklartefaktatyper.MARGINALT_ARBEID,
        MKV.Koder.landkoder.DE,
        KV.Koder.BoolskAvklartfaktaType.USANN
      ));
    });

    it('kaller resetForm for vedtak- og utpekformene', () => {
      expect(props.resetForm).toHaveBeenCalledTimes(2);
      expect(props.resetForm).toHaveBeenCalledWith(KV.Form.ARTIKKEL_13_X_VEDTAK);
      expect(props.resetForm).toHaveBeenCalledWith(KV.Form.ARTIKKEL_13_UTPEKLAND);
    });
  });
});
