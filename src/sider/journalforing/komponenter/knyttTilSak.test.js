import React from "react";

import * as Skjema from "../../../felleskomponenter/skjema";

import MKV from "../../../melosyskodeverk";

import { KnyttTilSak } from "./knyttTilSak";

describe("KnyttTilSak", () => {
  let props = null;

  beforeEach(() => {
    props = {
      sak: {
        behandlingOversikter: [
          {
            behandlingsstatus: { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET },
          },
        ],
      },
      behandlingstyper: [],
      opprettBehandling: jest.fn(),
    };
  });

  it(`vis knapp for å opprette ny behandling dersom ingen behandlinger har behandlingstype ${MKV.Koder.behandlinger.behandlingstyper.SED}`, () => {
    props.sak.behandlingOversikter[0].behandlingstype = { kode: MKV.Koder.behandlinger.behandlingstyper.SOEKNAD };

    const knyttTilSak = shallow(<KnyttTilSak {...props} />);

    const radios = knyttTilSak.find(Skjema.Radio);

    expect(radios).toHaveLength(2);
    expect(radios.first().props().label).toBe("Opprett ny behandling");
  });

  it(`Ikke vis knapp for å opprette ny behandling dersom minst 1 behandling har behandlingstype ${MKV.Koder.behandlinger.behandlingstyper.SED}`, () => {
    props.sak.behandlingOversikter[0].behandlingstype = { kode: MKV.Koder.behandlinger.behandlingstyper.SED };

    const knyttTilSak = shallow(<KnyttTilSak {...props} />);

    const radios = knyttTilSak.find(Skjema.Radio);

    expect(radios).toHaveLength(1);
    expect(radios.first().props().label).not.toBe("Opprett ny behandling");
  });
});
