import React from "react";
import MKV from "../../../melosyskodeverk";

import * as Services from "../../../services";

import { VurderingArtikkel16MottaSvar, FormKomponent } from "./vurderingArtikkel16MottaSvar";
import { DatoOmradeMedVarighet } from "../../../felleskomponenter/datoOmrade";

describe("VurderingArtikkel16MottaSvar", () => {
  let props = null;

  beforeEach(() => {
    props = {
      bekreftOgFortsett: jest.fn(),
      tilbake: jest.fn(),
      gyldigeSoknadsland: [],
      soknadsperiode: {
        periode: {
          fom: "fomdato",
          tom: "tomdato",
        },
      },
      redigerbart: true,
      lovvalgsperiodeFom: "lovfom",
      lovvalgsperiodeTom: "lovtom",
      oppdaterData: jest.fn(),
      slettData: jest.fn(),
      hentAnmodningsperiodeSvar: jest.fn(),
      tilstand: {},
      anmodningsperioderSvarStatus: Services.STATUS.OK,
    };
  });

  it("vises uten å krasje", () => {
    shallow(<VurderingArtikkel16MottaSvar {...props} />);
  });

  it("viser ett Datoomrademedvarighet", () => {
    const vurderingArtikkel16Vedtak = shallow(<VurderingArtikkel16MottaSvar {...props} />);

    expect(vurderingArtikkel16Vedtak.find(DatoOmradeMedVarighet)).toHaveLength(1);
    expect(vurderingArtikkel16Vedtak.find(DatoOmradeMedVarighet).props().periode).toBe(props.soknadsperiode);
  });

  it("viser en knapp", () => {
    const vurderingArtikkel16Vedtak = shallow(<VurderingArtikkel16MottaSvar {...props} />);

    const stegKnapper = vurderingArtikkel16Vedtak.find("StegKnapper");
    expect(stegKnapper).toHaveLength(1);
    stegKnapper.props().bekreftKnappProps.onClick();
    expect(props.bekreftOgFortsett).toHaveBeenCalledTimes(1);
  });
});

describe("FormKomponent", () => {
  it("viser en textarea ved delvis innvilgelse", () => {
    const props = {
      redigerbart: true,
      soknadsperiode: {},
      oppdaterData: jest.fn(),
      formIsValid: true,
      anmodningsperiodeID: "1",
      sendAnmodningsperiodeSvar: jest.fn(),
      formValues: {
        anmodningsperiodeSvarType: MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE,
      },
    };
    const formKomponent = shallow(<FormKomponent {...props} />);

    expect(formKomponent.find("Textarea")).toHaveLength(1);
  });
});
