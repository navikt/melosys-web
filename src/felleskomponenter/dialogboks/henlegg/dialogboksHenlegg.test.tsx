import React, { ComponentProps } from "react";

import * as Nav from "../../../navFrontend";

import { DialogboksHenleggSak } from "./dialogboksHenlegg";
import Knapperad from "../../knapperad";
import { KodeTermSelect } from "../../ui/kodeTermSelect";
import PdfLenkeListe from "../../pdfLenkeListe";
import { shallow } from "enzyme";
import { mock } from "ts-mockito";

describe("Dialogbokshenlegg", () => {
  const props = mock<ComponentProps<typeof DialogboksHenleggSak>>();

  beforeEach(() => {
    props.behandlingID = 1;
    props.redigerbart = true;
    props.ariaHideApp = false;
    props.avbryt = jest.fn();
    props.henleggHandle = jest.fn();
    props.dispatch = jest.fn();
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
