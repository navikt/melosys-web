import React, { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";

import { render, screen } from "@testing-library/react";
import PersonstatusModal from "./personstatusModal";

describe("PersonstatusModal", () => {
  const mockedProps = mock<ComponentProps<typeof PersonstatusModal>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
    props.lukkModal = jest.fn();
    props.skalViseModal = true;
    props.modalAriaHideApp = false;
    props.aktivePersonstatuser = [
      {
        kode: "BOSATT",
        tekst: "Bosatt etter folkeregisterloven",
        master: "PDL",
        kilde: "folkeregisteret",
        fregGyldighetstidspunkt: "2021-01-01",
        erHistorisk: false,
      },
    ];
    props.historiskePersonstatuser = [
      {
        kode: "IKKE_BOSATT",
        tekst: "Bosatt utenfor Norge",
        master: "PDL",
        kilde: "folkeregisteret",
        fregGyldighetstidspunkt: "2001-01-01",
        erHistorisk: true,
      },
      {
        kode: "BOSATT",
        tekst: "Bosatt etter folkeregisterloven",
        master: "PDL",
        kilde: "folkeregisteret",
        fregGyldighetstidspunkt: "2000-03-25",
        erHistorisk: true,
      },
    ];
  });

  it("viser tabell for aktiv personstatus og historiske personstatuser", () => {
    render(<PersonstatusModal {...props} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.queryByText("Ingen historikk registrert i folkeregisteret.")).not.toBeInTheDocument();
    expect(screen.getAllByText("Bosatt etter folkeregisterloven")).toHaveLength(2);
    expect(screen.getByText("Bosatt utenfor Norge")).toBeInTheDocument();
  });
});
