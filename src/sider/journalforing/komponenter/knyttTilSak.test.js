import React from "react";

import * as Skjema from "../../../felleskomponenter/skjema";
import { JOURNALFORING_VALUES } from "../../../kodeverk/form";

import MKV from "../../../melosyskodeverk";

import { KnyttTilSak } from "./knyttTilSak";

describe("KnyttTilSak", () => {
  let props = null;

  beforeEach(() => {
    props = {
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
            behandlingstype: { kode: MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG },
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

  it(`Vis komponent for knytte til eksisterende sak komponent og knapper for å opprette ny behandling dersom siste behandling er inaktiv`, () => {
    props.sak.behandlingOversikter[0].behandlingsstatus = { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET };

    const knyttTilSak = shallow(<KnyttTilSak {...props} />);
    const knyttTilEksisterendeSakKomponent = knyttTilSak.find(".knyttTilSak__panelramme");

    expect(knyttTilEksisterendeSakKomponent).toHaveLength(1);

    const radios = knyttTilEksisterendeSakKomponent.find(Skjema.Radio);

    expect(radios).toHaveLength(2);
    expect(radios.first().props().label).toBe("Opprett ny behandling");
  });

  it(`Ikke vis knytt til eksisterende sak komponent dersom siste behandling er aktiv`, () => {
    props.sak.behandlingOversikter[0].behandlingsstatus = {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    };

    const knyttTilSak = shallow(<KnyttTilSak {...props} />);
    const knyttTilEksisterendeSakKomponent = knyttTilSak.find(".knyttTilSak__panelramme");

    expect(knyttTilEksisterendeSakKomponent).toHaveLength(0);
  });

  it(`Ikke vis knytt til eksisterende sak komponent dersom status er henlagt`, () => {
    props.sak.saksstatus.kode = MKV.Koder.saksstatuser.HENLAGT;

    const knyttTilSak = shallow(<KnyttTilSak {...props} />);
    const knyttTilEksisterendeSakKomponent = knyttTilSak.find(".knyttTilSak__panelramme");

    expect(knyttTilEksisterendeSakKomponent).toHaveLength(0);
  });

  it(`Vis journalfør uten videre behandling dersom saktype er EØS`, () => {
    props.sak.behandlingOversikter[0].behandlingsstatus = {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    };
    props.sak.sakstype.kode = MKV.Koder.sakstyper.EU_EOS;

    const knyttTilSak = shallow(<KnyttTilSak {...props} />);

    const checkbox = knyttTilSak.find(Skjema.Checkbox);

    expect(checkbox).toHaveLength(1);
    expect(checkbox.first().props().label).toBe(`Oppdater behandlingsstatus til "Vurder dokument"`);
  });

  it(`Vis journalfør uten videre behandling dersom saktype er FTRL`, () => {
    props.sak.behandlingOversikter[0].behandlingsstatus = {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    };
    props.sak.sakstype.kode = MKV.Koder.sakstyper.FTRL;

    const knyttTilSak = shallow(<KnyttTilSak {...props} />);

    const checkbox = knyttTilSak.find(Skjema.Checkbox);

    expect(checkbox).toHaveLength(1);
    expect(checkbox.first().props().label).toBe(`Oppdater behandlingsstatus til "Vurder dokument"`);
  });

  it(`Vis journalfør uten videre behandling dersom saktype er TRYGDEAVTALE`, () => {
    props.sak.behandlingOversikter[0].behandlingsstatus = {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    };
    props.sak.sakstype.kode = MKV.Koder.sakstyper.TRYGDEAVTALE;

    const knyttTilSak = shallow(<KnyttTilSak {...props} />);

    const checkbox = knyttTilSak.find(Skjema.Checkbox);

    expect(checkbox).toHaveLength(1);
    expect(checkbox.first().props().label).toBe(`Oppdater behandlingsstatus til "Vurder dokument"`);
  });
});
