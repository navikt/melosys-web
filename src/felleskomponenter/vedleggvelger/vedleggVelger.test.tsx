import React, { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";
import { shallow } from "enzyme";

import { Lenkeknapp } from "../ui";
import * as Nav from "../../navFrontend";

import VedleggVelger from "./vedleggVelger";
import VedleggVelgerModal from "./vedleggVelgerModal";
import { VedleggTable } from "./vedleggTable";

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
    const vedleggTable = vedleggVelger.find(VedleggTable);
    const { valgteVedlegg } = vedleggTable.props();
    expect(valgteVedlegg).toHaveLength(1);
    expect(valgteVedlegg[0].id).toBe("ID2");
  });

  it("rendrer en knapp med tekst 'Legg til vedlegg'", () => {
    props.valgteVedlegg = [];
    const vedleggVelger = shallow(<VedleggVelger {...props} />);

    expect(vedleggVelger.find(Lenkeknapp).contains("Legg til vedlegg")).toBe(true);
  });
});

describe("VedleggVelgerModal", () => {
  const mockedProps = mock<ComponentProps<typeof VedleggVelgerModal>>();
  const props = instance(mockedProps);

  it("viser en Nav Modal", () => {
    const vedleggVelgerModal = shallow(<VedleggVelgerModal {...props} />);
    expect(vedleggVelgerModal.exists(Nav.Modal)).toBe(true);
  });
});
