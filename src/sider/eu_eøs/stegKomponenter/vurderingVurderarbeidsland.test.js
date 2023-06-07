import React from "react";

import * as Mui from "../../../felleskomponenter/ui";

import MKV from "../../../melosyskodeverk";

import { VurderingVurderarbeidsland } from "./vurderingArbeidsland/vurderingVurderarbeidsland";
import SokkelSkipListe from "../../../felleskomponenter/sokkelskipliste";

describe("VurderingVurderarbeidsland", () => {
  let props = null;

  beforeEach(() => {
    props = {
      begrunnelser: [],
      bekreftOgFortsett: jest.fn(),
      tilbake: jest.fn(),
      tilstand: {
        harAvklaring: true,
        sokkelEllerSkipListe: [],
        installasjonArbeidslandListe: [],
        installasjonArbeidslandTypeListe: [],
        arbeidslandListe: [],
        arbeidUtforesIOppgittLandFakta: undefined,
        fjernetArbeidslandFakta: [],
        harIngenMaritimeArbeidEllerHjemmebaser: false,
      },
      redigerbart: true,
      oppdaterData: jest.fn(),
      slettData: jest.fn(),
      maritimtArbeid: [
        {
          enhetNavn: "Dunfjæder",
          fartsomradeKode: "INNENRIKS",
          flaggLandkode: "GB",
          innretningLandkode: "GB",
          territorialfarvann: "GB",
          foretakNavn: "SWECO NORGE AS",
          foretakOrgnr: "967032271",
        },
      ],
      hjemmebaser: [MKV.Koder.landkoder.DE],
      soknadsland: [],
      arbeidsland: [],
      fjernedeArbeidsland: [],
      fjernedeSoknadsland: [],
    };
  });

  it("viser en Sokkelskipliste", () => {
    const vurderingVurderarbeidsland = shallow(<VurderingVurderarbeidsland {...props} />);

    expect(vurderingVurderarbeidsland.find(SokkelSkipListe)).toHaveLength(1);
  });

  it("viser to RedigerbarListe", () => {
    const vurderingVurderarbeidsland = shallow(<VurderingVurderarbeidsland {...props} />);

    expect(vurderingVurderarbeidsland.find(Mui.RedigerbarListe)).toHaveLength(2);
  });
});
