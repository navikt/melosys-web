import React from "react";

import * as Skjema from "../../../felleskomponenter/skjema";
import { JOURNALFORING_VALUES } from "../../../kodeverk/form";

import MKV from "../../../melosyskodeverk";

import { KnyttTilSak } from "./knyttTilSak";

describe("KnyttTilSak", () => {
  let props = null;

  beforeEach(() => {
    props = {
      behandleAlleSakerToggleEnabled: false,
      sak: {
        sakstype: {
          kode: MKV.Koder.sakstyper.EU_EOS,
        },
        sakstema: {
          kode: MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG,
        },
        saksstatus: {
          kode: MKV.Koder.saksstatuser.UNDER_BEHANDLING,
        },
        behandlingOversikter: [
          {
            behandlingsstatus: { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET },
            behandlingstype: { kode: MKV.Koder.behandlinger.behandlingstyper.SOEKNAD },
          },
        ],
      },
      formValues: {
        opprettBehandling: null,
        behandlingstema: null,
        behandlingstype: null,
        journalforingGjelder: null,
      },
      feltNavn: JOURNALFORING_VALUES,
      journalforingGjelder: MKV.Koder.aktoersroller.BRUKER,
      behandlingstyper: [],
      opprettBehandling: false,
      behandlingstema: "",
      behandlingstype: "",
      changeField: jest.fn(),
    };
  });

  it(`Vis knapp for å opprette ny behandling dersom ingen behandlinger har behandlingstype ${MKV.Koder.behandlinger.behandlingstyper.SED}`, () => {
    props.sak.behandlingOversikter[0].behandlingstype = { kode: MKV.Koder.behandlinger.behandlingstyper.SOEKNAD };

    const knyttTilSak = shallow(<KnyttTilSak {...props} />);

    const radios = knyttTilSak.find(Skjema.Radio);

    expect(radios).toHaveLength(1);
    expect(radios.first().props().label).toBe("Opprett ny behandling");
  });

  it(`Ikke vis knapp for å opprette ny behandling dersom minst 1 behandling har behandlingstype ${MKV.Koder.behandlinger.behandlingstyper.SED}`, () => {
    props.sak.behandlingOversikter[0].behandlingstype = { kode: MKV.Koder.behandlinger.behandlingstyper.SED };

    const knyttTilSak = shallow(<KnyttTilSak {...props} />);

    const radios = knyttTilSak.find(Skjema.Radio);

    expect(radios).toHaveLength(1);
    expect(radios.first().props().label).not.toBe("Opprett ny behandling");
  });

  it(`Ikke vis knapp for uten å opprette behandling dersom saktype er TRYGDEAVTALE`, () => {
    props.sak.behandlingOversikter[0].behandlingstype = { kode: MKV.Koder.behandlinger.behandlingstyper.SOEKNAD };
    props.sak.sakstype.kode = MKV.Koder.sakstyper.TRYGDEAVTALE;

    const knyttTilSak = shallow(<KnyttTilSak {...props} />);

    const radios = knyttTilSak.find(Skjema.Radio);

    expect(radios).toHaveLength(1);
    expect(radios.first().props().label).not.toBe("Uten å opprette behandling");
  });

  it(`Ikke vis knapp for uten å opprette behandling dersom saktype er EØS`, () => {
    props.sak.behandlingOversikter[0].behandlingstype = { kode: MKV.Koder.behandlinger.behandlingstyper.SOEKNAD };
    props.sak.sakstype.kode = MKV.Koder.sakstyper.EU_EOS;

    const knyttTilSak = shallow(<KnyttTilSak {...props} />);

    const radios = knyttTilSak.find(Skjema.Radio);

    expect(radios).toHaveLength(1);
    expect(radios.first().props().label).not.toBe("Uten å opprette behandling");
  });

  it(`Vis knapp for uten å opprette behandling dersom saktype er EØS og behandlingstype er SED`, () => {
    props.sak.behandlingOversikter[0].behandlingstype = { kode: MKV.Koder.behandlinger.behandlingstyper.SED };
    props.sak.sakstype.kode = MKV.Koder.sakstyper.EU_EOS;

    const knyttTilSak = shallow(<KnyttTilSak {...props} />);

    const radios = knyttTilSak.find(Skjema.Radio);

    expect(radios).toHaveLength(1);
    expect(radios.first().props().label).toBe("Uten å opprette behandling");
  });

  it(`Vis journalfør uten videre behandling dersom saktype er EØS og sakstema-toggle er enabled`, () => {
    props.sak.behandlingOversikter[0].behandlingsstatus = {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    };
    props.sak.sakstype.kode = MKV.Koder.sakstyper.EU_EOS;
    props.behandleAlleSakerToggleEnabled = true;

    const knyttTilSak = shallow(<KnyttTilSak {...props} />);

    const checkbox = knyttTilSak.find(Skjema.Checkbox);

    expect(checkbox).toHaveLength(1);
    expect(checkbox.first().props().label).toBe("Journalfør uten videre behandling");
  });

  it(`Ikke vis journalfør uten videre behandling dersom saktype er FTLR og sakstema-toggle er enabled`, () => {
    props.sak.behandlingOversikter[0].behandlingsstatus = {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    };
    props.sak.sakstype.kode = MKV.Koder.sakstyper.FTRL;
    props.behandleAlleSakerToggleEnabled = true;

    const knyttTilSak = shallow(<KnyttTilSak {...props} />);

    const checkbox = knyttTilSak.find(Skjema.Checkbox);

    expect(checkbox).toHaveLength(0);
  });

  it(`Vis journalfør uten videre behandling dersom saktype er FTLR og sakstema-toggle er disabled`, () => {
    props.sak.behandlingOversikter[0].behandlingsstatus = {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    };
    props.sak.sakstype.kode = MKV.Koder.sakstyper.FTRL;
    props.behandleAlleSakerToggleEnabled = false;

    const knyttTilSak = shallow(<KnyttTilSak {...props} />);

    const checkbox = knyttTilSak.find(Skjema.Checkbox);

    expect(checkbox).toHaveLength(1);
    expect(checkbox.first().props().label).toBe("Journalfør uten videre behandling");
  });

  it(`Ikke vis knytt til eksisterende sak komponent dersom status er henlagt og sakstema er enabled`, () => {
    props.sak.saksstatus.kode = MKV.Koder.saksstatuser.HENLAGT;
    props.behandleAlleSakerToggleEnabled = true;

    const knyttTilSak = shallow(<KnyttTilSak {...props} />);
    const knyttTilEksisterendeSakKomponent = knyttTilSak.find(".knyttTilSak__panelramme");

    expect(knyttTilEksisterendeSakKomponent).toHaveLength(0);
  });

  it(`Vis knytt til eksisterende sak komponent dersom status er henlagt og sakstema er disabled`, () => {
    props.sak.saksstatus.kode = MKV.Koder.saksstatuser.HENLAGT;
    props.behandleAlleSakerToggleEnabled = false;

    const knyttTilSak = shallow(<KnyttTilSak {...props} />);
    const knyttTilEksisterendeSakKomponent = knyttTilSak.find(".knyttTilSak__panelramme");

    expect(knyttTilEksisterendeSakKomponent).toHaveLength(1);
  });
});
