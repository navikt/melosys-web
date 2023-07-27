import { shallow } from "enzyme";

import { FaneViser, FaneViserProps } from "./sideDialog";

import SideDialogDokumenter from "./sideDialogDokumenter";
import SideDialogSedBestilling from "./sideDialogOpprettNyBuc";
import SideDialogBesvarSed from "./sideDialogBesvarSed";
import SideDialogSendBrev from "./sendBrev";

describe("SideDialog", () => {
  describe("FaneViser", () => {
    let props: FaneViserProps;

    beforeEach(() => {
      props = {
        navn: "dokumenter",
        behandlingID: 4,
        saksnummer: "4",
        sakstype: "TRYGDEAVTALE",
        behandlingstema: "YRKESAKTIV",
        endreFane: vi.fn(),
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

        const sendBrev = faner.find(SideDialogSendBrev);

        expect(sendBrev).toHaveLength(1);
        expect(sendBrev.props().redigerbart).toBe(props.redigerbart);
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
