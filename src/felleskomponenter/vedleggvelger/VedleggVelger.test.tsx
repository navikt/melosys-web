import React, { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";
import { shallow } from "enzyme";

import * as Mui from "../ui";

import VedleggVelger, { VedleggListe } from "./VedleggVelger";

describe("VedleggVelger", () => {
  const mockedProps = mock<ComponentProps<typeof VedleggVelger>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  it("markerer valgte vedlegg ved mount", () => {
    props.dokumenter = [
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

    const vedleggVelger = shallow(<VedleggVelger {...props} />);
    const vedleggListe = vedleggVelger.find(VedleggListe);
    const { markerteVedlegg } = vedleggListe.props();
    expect(markerteVedlegg.length === 1);
    expect(markerteVedlegg.find((str) => str === "ID2"));
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
