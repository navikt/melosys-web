import React, { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";

import { render, screen } from "@testing-library/react";

import SivilstandModal from "./sivilstandModal";

describe("SivilstandModal", () => {
  const mockedProps = mock<ComponentProps<typeof SivilstandModal>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
    props.lukkModal = jest.fn();
    props.modalAriaHideApp = false;
    props.skalViseModal = true;
    props.aktiveSivilstander = [
      {
        type: "Gift",
        relatertVedSivilstand: "123",
        bekreftelsesdato: "2009-10-09",
        gyldigFraOgMed: "2009-10-10",
        master: "PDL",
        kilde: "FREG",
        erHistorisk: false,
      },
    ];
    props.historiskeSivilstander = [
      {
        type: "Ugift",
        relatertVedSivilstand: "321",
        bekreftelsesdato: "2008-01-01",
        gyldigFraOgMed: "2008-01-02",
        master: "PDL",
        kilde: "FREG",
        erHistorisk: true,
      },
    ];
  });

  it("viser tabell for aktiv sivilstand og historiske sivilstander", () => {
    render(<SivilstandModal {...props} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.queryByText("Ingen historikk registrert i folkeregisteret.")).not.toBeInTheDocument();
    expect(screen.getByText("Gift")).toBeInTheDocument();
    expect(screen.getByText("Ugift")).toBeInTheDocument();
  });
});
