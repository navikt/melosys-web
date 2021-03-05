import React, { ComponentProps } from "react";
import { mock, instance } from "ts-mockito";
import { shallow } from "enzyme";

import * as Mui from "../ui";

import VedleggVelger, { VedleggListe, EnkeltVedlegg } from "./VedleggVelger";

describe("VedleggListe", () => {
  const mockedProps = mock<ComponentProps<typeof VedleggListe>>();
  const props = instance(mockedProps);

  it("markerer valgte vedlegg ved mount", () => {
    props.redigerer = true;
    props.alleVedlegg = [
      {
        journalpostID: "",
        dokumentID: "",
        tittel: "",
        logiskeVedlegg: [],
        avsenderEllerMottaker: "",
        id: "ID1",
        dato: "",
      },
      {
        journalpostID: "",
        dokumentID: "",
        tittel: "",
        logiskeVedlegg: [],
        avsenderEllerMottaker: "",
        id: "ID2",
        dato: "",
      },
    ];
    props.valgteVedlegg = [
      {
        journalpostID: "",
        dokumentID: "",
        tittel: "",
        logiskeVedlegg: [],
        avsenderEllerMottaker: "",
        id: "ID2",
        dato: "",
      },
    ];

    const vedleggListe = shallow(<VedleggListe {...props} />);
    const enkeltVedlegg = vedleggListe.find(EnkeltVedlegg);

    expect(enkeltVedlegg.first().props().vedleggErMarkert).toBe(false);
    expect(enkeltVedlegg.last().props().vedleggErMarkert).toBe(true);
  });
});

describe("VedleggVelger", () => {
  const mockedProps = mock<ComponentProps<typeof VedleggVelger>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  it("rendrer en knapp med tekst 'Legg til vedlegg' når ingen vedlegg er markert", () => {
    props.valgteVedlegg = [];
    const vedleggVelger = shallow(<VedleggVelger {...props} />);

    expect(vedleggVelger.find(Mui.Knapp).contains("Legg til vedlegg")).toBe(true);
  });

  it("rendrer en knapp med tekst 'Legg til andre vedlegg' når minst ett vedlegg er markert", () => {
    props.valgteVedlegg = [
      {
        dokumentID: "1234",
        tittel: "dokument",
        logiskeVedlegg: [],
        id: "2345",
        journalpostID: "987987",
        dato: null,
        avsenderEllerMottaker: "AVSENDER",
      },
    ];
    const vedleggVelger = shallow(<VedleggVelger {...props} />);

    expect(vedleggVelger.find(Mui.Knapp).contains("Legg til andre vedlegg")).toBe(true);
  });
});
