import React from "react";
import { shallow } from "enzyme";

import { FaneViser, FaneViserProps } from "./sideDialog";

import SideDialogDokumenter from "./sideDialogDokumenter";
import SideDialogSedBestilling from "./sideDialogOpprettNyBuc";
import SideDialogBesvarSed from "./sideDialogBesvarSed";
import { FeatureToggle } from "../../featuretoggle";

describe("SideDialog", () => {
  describe("FaneViser", () => {
    let props: FaneViserProps;

    beforeEach(() => {
      props = {
        navn: "dokumenter",
        behandlingID: 4,
        saksnummer: "4",
        brevBestillingRedigerbartIArtikkel13: false,
        brevBestillingRedigerbart: false,
        redigerbart: true,
        dokumentOversikt: [
          {
            journalpostID: "321",
            journalforingDato: null,
            mottattDato: null,
            avsenderEllerMottaker: "avsendernavn",
            mottaksretning: { kode: "INN", term: "Inngående" },
            hoveddokument: {
              tittel: "tittel",
              dokumentID: "123",
              logiskeVedlegg: [],
            },
            vedlegg: [],
          },
        ],
        dokumenter: [],
      };
    });

    describe("Navn-prop styrer visning av", () => {
      it("SideDialogDokumenter", () => {
        props.navn = "dokumenter";
        const faner = shallow(<FaneViser {...props} />);

        const sideDialogDokumenter = faner.find(SideDialogDokumenter);
        expect(sideDialogDokumenter).toHaveLength(1);
        expect(sideDialogDokumenter.props().dokumentOversikt.length).toEqual(1);
      });

      it("SideDialogSendBrev", () => {
        props.navn = "brevbestilling";
        const faner = shallow(<FaneViser {...props} />);

        const featureToggle = faner.find(FeatureToggle);
        const childProps = featureToggle.props();

        expect(featureToggle).toHaveLength(1);
        expect(childProps.togglename).toBe("melosys.nytt_send_brev");
      });

      it("SideDialogSedBestilling", () => {
        props.navn = "sedbestilling";
        const faner = shallow(<FaneViser {...props} />);

        const sideDialogSedBestilling = faner.find(SideDialogSedBestilling);
        expect(sideDialogSedBestilling).toHaveLength(1);
        expect(sideDialogSedBestilling.props().behandlingID).toBe(props.behandlingID);
      });

      it("SideDialogBesvarSed", () => {
        props.navn = "besvarsed";
        const faner = shallow(<FaneViser {...props} />);

        const sideDialogBesvarSed = faner.find(SideDialogBesvarSed);
        expect(sideDialogBesvarSed).toHaveLength(1);
        expect(sideDialogBesvarSed.props().behandlingID).toBe(props.behandlingID);
      });
    });
  });
});
