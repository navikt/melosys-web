import React, { ComponentProps } from "react";
import { mock, instance } from "ts-mockito";
import { shallow } from "enzyme";

import { VedleggListe, EnkeltVedlegg } from "./VedleggVelger";

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
