import React from "react";

import MKV from "../../../melosyskodeverk";

import { VurderingArtikkel16Vedtak, Innvilgelse, DelvisInnvilgelse, Avslag } from "./vurderingArtikkel16Vedtak";

describe("VurderingArtikkel16Vedtak", () => {
  let props = null;

  beforeEach(() => {
    props = {
      anmodningsperiodesvar: {
        anmodningsperiodeSvarType: MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE,
        endretPeriode: { fom: "datofom", tom: "datotom" },
        begrunnelseFritekst: "fritekst",
      },
      behandlingID: 1,
      lagreOgFatteVedtak: jest.fn(),
      tilbake: jest.fn(),
      redigerbart: true,
      vilkarBegrunnelser: [],
      art_12_1_begrunnelser: [],
      art_12_2_begrunnelser: [],
      formIsValid: true,
      behandlingstype: MKV.Koder.behandlinger.behandlingstyper.SOEKNAD,
      touch: jest.fn(),
      formValues: {
        vedtakstypebegrunnelse: MKV.Koder.begrunnelser.nyvurderingbakgrunner.FEIL_I_BEHANDLING,
        vedtakstype: MKV.Koder.vedtakstyper.KORRIGERINGSVEDTAK,
        vedtaksbrevFritekst: "Test",
      },
      harValgtNorskArbeidsgiver: true,
      hentLovvalgsperioder: jest.fn(),
      lagreLovvalgsperioder: jest.fn(),
      endreLovvalgsperiode: jest.fn(),
    };
  });

  it("viser innvilgelse-komponent ved innvilgelse", () => {
    props.anmodningsperiodesvar.anmodningsperiodeSvarType = MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE;
    const vurderingArtikkel16Vedtak = shallow(<VurderingArtikkel16Vedtak {...props} />);

    expect(vurderingArtikkel16Vedtak.find(Innvilgelse)).toHaveLength(1);
  });

  it('viser "delvis innvilgelse"-komponent ved delvis innvilgelse', () => {
    props.anmodningsperiodesvar.anmodningsperiodeSvarType = MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE;
    const vurderingArtikkel16Vedtak = shallow(<VurderingArtikkel16Vedtak {...props} />);

    expect(vurderingArtikkel16Vedtak.find(DelvisInnvilgelse)).toHaveLength(1);
  });

  it("viser avslag-komponent ved avslag", () => {
    props.anmodningsperiodesvar.anmodningsperiodeSvarType = MKV.Koder.anmodningsperiodesvartyper.AVSLAG;
    const vurderingArtikkel16Vedtak = shallow(<VurderingArtikkel16Vedtak {...props} />);

    expect(vurderingArtikkel16Vedtak.find(Avslag)).toHaveLength(1);
  });

  it("viser en knapp for å fatte vedtak", () => {
    const vurderingArtikkel16Vedtak = shallow(<VurderingArtikkel16Vedtak {...props} />);

    expect(vurderingArtikkel16Vedtak.find("StegKnapper")).toHaveLength(1);
    vurderingArtikkel16Vedtak.find("StegKnapper").props().bekreftKnappProps.onClick();
    expect(props.lagreOgFatteVedtak).toHaveBeenCalledTimes(1);
  });
});
