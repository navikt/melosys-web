import React from "react";

import * as EKV from "eessi-kodeverk";
import * as Nav from "../../navFrontend";
import MKV from "../../melosyskodeverk";

import SideDialogOpprettNyBuc from "./sideDialogOpprettNyBuc";

describe("SideDialogOpprettNyBuc", () => {
  describe("Tilgjengelige BUC", () => {
    let props;

    beforeEach(() => {
      props = {
        behandlingID: 1,
        behandlingstema: "",
        dokumenter: [],
        sakstype: "",
      };
    });

    it("LA_BUC_01 vises for behandlingstema UTSENDT_ARBEIDSGIVER", () => {
      props.behandlingstema = MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER;
      const sideDialogOpprettNyBuc = shallow(<SideDialogOpprettNyBuc {...props} />);

      const tilgjengeligeBuc = sideDialogOpprettNyBuc.find(Nav.Select).get(1).props.children[1];

      expect(tilgjengeligeBuc).toHaveLength(6);
      expect(tilgjengeligeBuc[0].props.value).toBe(EKV.Koder.buctyper.legislation.LA_BUC_01);
    });

    it("LA_BUC_01 vises for behandlingstema UTSENDT_SELVSTENDIG", () => {
      props.behandlingstema = MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG;
      const sideDialogOpprettNyBuc = shallow(<SideDialogOpprettNyBuc {...props} />);

      const tilgjengeligeBuc = sideDialogOpprettNyBuc.find(Nav.Select).get(1).props.children[1];

      expect(tilgjengeligeBuc).toHaveLength(6);
      expect(tilgjengeligeBuc[0].props.value).toBe(EKV.Koder.buctyper.legislation.LA_BUC_01);
    });

    it("LA_BUC_01 vises for behandlingstema IKKE_YRKESAKTIV og sakstype EU_EØS", () => {
      props.behandlingstema = MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV;
      props.sakstype = MKV.Koder.sakstyper.EU_EOS;
      const sideDialogOpprettNyBuc = shallow(<SideDialogOpprettNyBuc {...props} />);

      const tilgjengeligeBuc = sideDialogOpprettNyBuc.find(Nav.Select).get(1).props.children[1];

      expect(tilgjengeligeBuc).toHaveLength(6);
      expect(tilgjengeligeBuc[0].props.value).toBe(EKV.Koder.buctyper.legislation.LA_BUC_01);
    });

    it("LA_BUC_01 vises ikke for behandlingstema YRKESAKTIV", () => {
      props.behandlingstema = MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV;
      const sideDialogOpprettNyBuc = shallow(<SideDialogOpprettNyBuc {...props} />);

      const tilgjengeligeBuc = sideDialogOpprettNyBuc.find(Nav.Select).get(1).props.children[1];

      expect(tilgjengeligeBuc).toHaveLength(5);
      expect(tilgjengeligeBuc[0].props.value).not.toBe(EKV.Koder.buctyper.legislation.LA_BUC_01);
    });

    it("LA_BUC_01 vises ikke for behandlingstema IKKE_YRKESAKTIV og sakstype FTRL", () => {
      props.behandlingstema = MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV;
      props.sakstype = MKV.Koder.sakstyper.FTRL;
      const sideDialogOpprettNyBuc = shallow(<SideDialogOpprettNyBuc {...props} />);

      const tilgjengeligeBuc = sideDialogOpprettNyBuc.find(Nav.Select).get(1).props.children[1];

      expect(tilgjengeligeBuc).toHaveLength(5);
      expect(tilgjengeligeBuc[0].props.value).not.toBe(EKV.Koder.buctyper.legislation.LA_BUC_01);
    });
  });
});
