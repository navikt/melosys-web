import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import * as Api from "../../../services/api";
import SideDialogNotater from "./sideDialogNotater";

vi.mock("../../../services/api", () => ({
  Fagsaker: {
    notater: {
      hent: vi.fn(),
      opprett: vi.fn(),
      oppdater: vi.fn(),
    },
  },
}));

const hentMock = vi.mocked(Api.Fagsaker.notater.hent);
const opprettMock = vi.mocked(Api.Fagsaker.notater.opprett);

const nyttNotatFraBackend = {
  notatId: 42,
  tekst: "Sjekket 25 %-regelen",
  behandlingId: 7,
  behandlingstypeKode: "AARSAVREGNING",
  behandlingstemaKode: "MEDLEMSKAP_LOVVALG",
  registrertAvNavn: "Saksbehandler",
  registrertDato: "2026-09-03T10:00:00Z",
  endretDato: "2026-09-03T10:00:00Z",
  redigerbar: true,
};

const opprettNotatViaDialog = async (tekst: string) => {
  fireEvent.click(screen.getByRole("button", { name: "Legg til nytt notat" }));
  fireEvent.change(screen.getByLabelText("Notat"), { target: { value: tekst } });
  fireEvent.click(screen.getByRole("button", { name: "Lagre notat" }));
  await waitFor(() => expect(opprettMock).toHaveBeenCalledTimes(1));
};

describe("SideDialogNotater", () => {
  let props: any;

  beforeEach(() => {
    vi.clearAllMocks();
    hentMock.mockResolvedValue([]);
    opprettMock.mockResolvedValue(nyttNotatFraBackend);

    props = {
      saksnummer: "1",
      behandlingID: 7,
      redigerbart: true,
    };
  });

  it("snapshot test", () => {
    const { container } = render(<SideDialogNotater {...props} />);
    expect(container).toMatchSnapshot();
  });

  it("sender behandlingId ved opprettelse slik at notatet havner på behandlingen saksbehandler står i", async () => {
    render(<SideDialogNotater {...props} />);

    await opprettNotatViaDialog("Sjekket 25 %-regelen");

    expect(opprettMock).toHaveBeenCalledWith("1", { tekst: "Sjekket 25 %-regelen", behandlingId: 7 });
  });

  it("utelater behandlingId når behandlingID mangler, slik at backend faller tilbake til aktiv behandling", async () => {
    render(<SideDialogNotater {...props} behandlingID={undefined} />);

    await opprettNotatViaDialog("Notat uten behandling");

    expect(opprettMock).toHaveBeenCalledWith("1", { tekst: "Notat uten behandling" });
  });

  it("viser feilmelding fra backend når notatet ikke kan knyttes til én behandling", async () => {
    opprettMock.mockRejectedValue({
      status: 400,
      body: { message: "Fagsaken har flere aktive årsavregninger, behandlingId må oppgis" },
    });
    render(<SideDialogNotater {...props} />);

    await opprettNotatViaDialog("Notat");

    expect(
      await screen.findByText("Fagsaken har flere aktive årsavregninger, behandlingId må oppgis"),
    ).toBeInTheDocument();
  });
});
