import React from "react";
import { combineReducers, createStore } from "redux";
import { reducer as formReducer } from "redux-form";

import * as Mui from "../../../felleskomponenter/ui";

import { VurderingVideresend } from "./vurderingVideresend";
import PdfLenkeListe from "../../../felleskomponenter/pdfLenkeListe";
import * as Skjema from "../../../felleskomponenter/skjema";

describe("Vurderingvideresend", () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
      behandlingID: 4,
      videresendSoknad: jest.fn(),
      tilbake: jest.fn(),
      bostedsland: { kode: "SE", term: "Sverige" },
      handleSubmit: jest.fn(),
      form: "form",
      fysiskeDokument: [],
    };
  });

  it("viser fritekst til orienteringsbrev", () => {
    const vurderingVideresend = shallow(<VurderingVideresend {...props} />);

    expect(
      vurderingVideresend.findWhere(
        (n) => n.type() === Skjema.Textarea && n.props().label === "Fritekst til orienteringsbrev"
      )
    ).toHaveLength(1);
  });

  it("viser en PdfLenkeListe med korrekte props", () => {
    const vurderingVideresend = shallow(<VurderingVideresend {...props} />);

    const pdfLenkeListe = vurderingVideresend.find(PdfLenkeListe);
    const pdfLenkeListeProps = pdfLenkeListe.props();

    expect(pdfLenkeListe).toHaveLength(1);
    expect(pdfLenkeListeProps.behandlingID).toBe(props.behandlingID);
  });

  it("viser ikke pdfLenkeListe dersom ikke redigerbart", () => {
    props.redigerbart = false;
    const vurderingVideresend = shallow(<VurderingVideresend {...props} />);

    expect(vurderingVideresend.find(PdfLenkeListe)).toHaveLength(0);
  });

  it("setter korrekte props for bekreftKnapp", () => {
    const store = createStore(combineReducers({ form: formReducer }));
    const vurderingVideresend = shallow(<VurderingVideresend {...props} store={store} />);
    const stegKnapper = vurderingVideresend.find(Mui.StegKnapper);

    expect(stegKnapper).toHaveLength(1);
    expect(stegKnapper.props().bekreftKnappProps.disabled).toBe(!props.redigerbart);
  });

  it("kaller videresendSoknad-prop ved submit av form", () => {
    const store = createStore(combineReducers({ form: formReducer }));
    const vurderingVideresend = shallow(<VurderingVideresend {...props} store={store} />);
    const form = vurderingVideresend.find("form");

    form.simulate("submit");

    expect(props.handleSubmit).toHaveBeenCalledTimes(1);
  });
});
