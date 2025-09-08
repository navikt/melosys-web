import { describe, it, expect, beforeEach } from "vitest";

import MKV from "../../melosyskodeverk";

import SideDialogOpprettNyBuc from "./sideDialogOpprettNyBuc";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";

describe("SideDialogOpprettNyBuc", () => {
  const WrappedSideDialogOpprettNyBuc = reduxForm({ form: "test" })(SideDialogOpprettNyBuc as any);

  describe("Tilgjengelige BUC", () => {
    let props: any;

    beforeEach(() => {
      props = {
        behandlingID: 1,
        behandlingstema: "",
        dokumenter: [],
        sakstype: "",
        redigerbart: true,
      };
    });

    it("LA_BUC_01 vises for behandlingstema UTSENDT_ARBEIDSGIVER", () => {
      props.behandlingstema = MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER;

      const { getByRole } = renderWithProviders(<WrappedSideDialogOpprettNyBuc {...props} />);

      expect(getByRole("option", { name: "LA_BUC_01 - Anmodning om unntak" })).toBeInTheDocument();
    });

    it("LA_BUC_01 vises for behandlingstema UTSENDT_SELVSTENDIG", () => {
      props.behandlingstema = MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG;

      const { getByRole } = renderWithProviders(<WrappedSideDialogOpprettNyBuc {...props} />);

      expect(getByRole("option", { name: "LA_BUC_01 - Anmodning om unntak" })).toBeInTheDocument();
    });

    it("LA_BUC_01 vises for behandlingstema IKKE_YRKESAKTIV og sakstype EU_EØS", () => {
      props.behandlingstema = MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV;
      props.sakstype = MKV.Koder.sakstyper.EU_EOS;

      const { getByRole } = renderWithProviders(<WrappedSideDialogOpprettNyBuc {...props} />);

      expect(getByRole("option", { name: "LA_BUC_01 - Anmodning om unntak" })).toBeInTheDocument();
    });

    it("LA_BUC_01 vises ikke for behandlingstema YRKESAKTIV", () => {
      props.behandlingstema = MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV;

      const { queryByRole } = renderWithProviders(<WrappedSideDialogOpprettNyBuc {...props} />);

      expect(queryByRole("option", { name: "LA_BUC_01 - Anmodning om unntak" })).not.toBeInTheDocument();
    });

    it("LA_BUC_01 vises ikke for behandlingstema IKKE_YRKESAKTIV og sakstype FTRL", () => {
      props.behandlingstema = MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV;
      props.sakstype = MKV.Koder.sakstyper.FTRL;

      const { queryByRole } = renderWithProviders(<WrappedSideDialogOpprettNyBuc {...props} />);

      expect(queryByRole("option", { name: "LA_BUC_01 - Anmodning om unntak" })).not.toBeInTheDocument();
    });
  });
});
