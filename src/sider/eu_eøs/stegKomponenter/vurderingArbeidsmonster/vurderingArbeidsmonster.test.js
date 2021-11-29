import React from "react";

import * as KV from "../../../../kodeverk";

import { BOOLSK_STRING } from "../../../../constants";
import MKV from "../../../../melosyskodeverk";
import { lagAvklartfakta } from "../../../../felleskomponenter/stegvelger";

import {
  VurderingArbeidsmonster,
  MarginaltArbeid,
  CheckableLandLinje,
  ConnectedCheckableLandLinje,
  UkjenteEllerFlereEosLandLinje,
} from "./vurderingArbeidsmonster";
import LandLinje from "./landlinje";

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

describe("MarginaltArbeid", () => {
  let props = null;

  beforeEach(() => {
    props = {
      arbeidsland: [
        {
          land: { kode: "DK", term: "Danmark" },
          erLonnetArbeid: true,
          erSelvstendigNaeringsvirksomhet: true,
        },
      ],
      marginaltArbeid: [],
      redigerbart: true,
      oppdaterData: jest.fn(),
      soknadsland: {
        landkoder: ["DK"],
        erUkjenteEllerAlleEosLand: false,
      },
    };
  });

  it("viser ConnectedCheckableLandLinje`r når erUkjenteEllerAlleEosLand er false", () => {
    const marginaltArbeid = shallow(<MarginaltArbeid {...props} />);

    const landLinjer = marginaltArbeid.find(ConnectedCheckableLandLinje);

    expect(landLinjer).toHaveLength(1);
  });

  it("viser 1 UkjenteEllerFlereEosLandLinje når erUkjenteEllerAlleEosLand er true", () => {
    props.soknadsland.erUkjenteEllerAlleEosLand = true;
    const marginaltArbeid = shallow(<MarginaltArbeid {...props} />);

    const landLinjer = marginaltArbeid.find(UkjenteEllerFlereEosLandLinje);

    expect(landLinjer).toHaveLength(1);
  });
});

describe("CheckableLandLinje", () => {
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

      const checkableLandLinje = shallow(<CheckableLandLinje {...props} />);
      const landLinje = checkableLandLinje.find(LandLinje);

      const checkboxOnCheck = landLinje.props().checkbox.onCheck;

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

describe("UkjenteEllerFlereEosLandLinje", () => {
  it("viser en LandLinje med ikke-redigerbar checkbox", () => {
    const ukjenteEllerFlereEosLandLinje = shallow(<UkjenteEllerFlereEosLandLinje />);
    const landLinje = ukjenteEllerFlereEosLandLinje.find(LandLinje);

    expect(landLinje).toHaveLength(1);
    expect(landLinje.props().checkbox.redigerbart).toBe(false);
  });
});
