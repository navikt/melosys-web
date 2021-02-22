import React from "react";

import * as KV from "../../../kodeverk";
import * as Mui from "../../../felleskomponenter/ui";

import { BOOLSK_STRING } from "../../../constants";
import MKV from "../../../melosyskodeverk";
import { lagAvklartfakta } from "../../../regler/avklartefakta";

import { VurderingArbeidsmonster, LandLinje } from "./vurderingArbeidsmonster";

describe("VurderingVurderarbeidsland", () => {
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
        yrkesaktivitet: "",
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

  it("viser Arbeidsmønstersteg uten å krasje", () => {
    shallow(<VurderingArbeidsmonster {...props} />);
  });
});

describe("LandLinje", () => {
  describe("ved klikk på checkbox", () => {
    let props = null;

    beforeEach(() => {
      props = {
        landKode: MKV.KTObjects.landkoder.find(({ kode }) => kode === MKV.Koder.landkoder.DE),
        avklartMarginaltArbeidILand: { fakta: ["TRUE"] },
        oppdaterData: jest.fn(),
        redigerbart: true,
        resetForm: jest.fn(),
      };

      const landLinje = shallow(<LandLinje {...props} />);
      const checkbox = landLinje.find(Mui.Checkbox);
      const checkboxOnCheck = checkbox.props().onCheck;

      checkboxOnCheck();
    });

    it("lagrer marginalt arbeid avklartfakta", () => {
      expect(props.oppdaterData).toHaveBeenCalledTimes(1);
      expect(props.oppdaterData).toHaveBeenLastCalledWith(
        lagAvklartfakta(MKV.Koder.avklartefaktatyper.MARGINALT_ARBEID, MKV.Koder.landkoder.DE, BOOLSK_STRING.USANN)
      );
    });

    it("kaller resetForm for vedtak- og utpekformene", () => {
      expect(props.resetForm).toHaveBeenCalledTimes(2);
      expect(props.resetForm).toHaveBeenCalledWith(KV.Form.ARTIKKEL_13_X_VEDTAK);
      expect(props.resetForm).toHaveBeenCalledWith(KV.Form.ARTIKKEL_13_UTPEKLAND);
    });
  });
});
