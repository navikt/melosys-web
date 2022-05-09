import React, { ComponentProps } from "react";
import { shallow } from "enzyme";
import { instance, mock } from "ts-mockito";

import * as Nav from "../../../navFrontend";

import Knapperad from "../../knapperad";
import PdfLenkeListe from "../../pdfLenkeListe";
import { DialogboksHenleggSak } from "./dialogboksHenlegg";
import { KodeTermSelect } from "../../ui/kodeTermSelect";

describe("Dialogbokshenlegg", () => {
  const mockedProps = mock<ComponentProps<typeof DialogboksHenleggSak>>();
  const props = instance(mockedProps);

  beforeEach(() => {
    props.behandlingID = 1;
    props.redigerbart = true;
    props.ariaHideApp = false;
    props.avbryt = jest.fn();
    props.henleggHandle = jest.fn();
    // props.dispatch = jest.fn();
    props.feilmeldinger = [];
    props.kontrollerVedtak = jest.fn();
  });

  it("viser en Nav Modal", () => {
    const komponent = shallow(<DialogboksHenleggSak {...props} />);
    expect(komponent.exists(Nav.Modal)).toBe(true);
  });

  describe("Modal", () => {
    it("viser en dropdownliste", () => {
      const komponent = shallow(<DialogboksHenleggSak {...props} />);
      expect(komponent.exists(KodeTermSelect)).toBe(true);
    });

    it("viser en pdflenkeliste", () => {
      const komponent = shallow(<DialogboksHenleggSak {...props} />);
      expect(komponent.exists(PdfLenkeListe)).toBe(true);
    });

    it("viser en Knapperad", () => {
      props.redigerbart = false;
      const komponent = shallow(<DialogboksHenleggSak {...props} />);

      expect(komponent.find(Knapperad).props().redigerbart).toBe(props.redigerbart);
      expect(komponent.find(Knapperad).props().avbryt).toBe(props.avbryt);
    });
  });
});
