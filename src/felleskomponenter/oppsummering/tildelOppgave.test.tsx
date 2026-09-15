import { vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";
import TildelOppgave from "./tildelOppgave";
import sjekkStatuskode from "../../services/sjekkStatuskode";

const KNAPP = "Legg behandlingen i mine oppgaver";

const tildel = vi.fn();
const hentBehandling = vi.fn();
let toggleEnabled: boolean | undefined = true;

vi.mock("../../services/api", () => ({
  Oppgaver: {
    tildel: (...args: unknown[]) => tildel(...args),
  },
}));

vi.mock("../../featuretoggle", () => ({
  useFeatureToggle: () => toggleEnabled,
}));

vi.mock("../../ducks/behandlinger", async () => {
  const faktisk = await vi.importActual<typeof import("../../ducks/behandlinger")>("../../ducks/behandlinger");
  return {
    ...faktisk,
    behandlingerOperations: {
      ...faktisk.behandlingerOperations,
      oppdaterBehandling: () => hentBehandling,
    },
  };
});

const render = (behandlingData: Record<string, unknown>) =>
  renderWithProviders(<TildelOppgave />, {
    preloadedState: { behandlinger: { data: { behandlingID: 42, tildelingTilgjengelig: true, ...behandlingData } } },
  });

describe("TildelOppgave", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    toggleEnabled = true;
    tildel.mockResolvedValue(undefined);
  });

  it("viser ingenting når toggelen er av", () => {
    toggleEnabled = false;
    const { container } = render({ tilordnetNavn: null, tilordnetMeg: false, kanTildeles: true });
    expect(container).toBeEmptyDOMElement();
  });

  it("rendrer saksbehandler med samme nøkkel og verdi som saksnummer", () => {
    const { container } = render({ tilordnetNavn: "Ola Nordmann", tilordnetMeg: false, kanTildeles: true });

    const verdiPar = container.querySelector(".oppsummering_verdi_par");

    expect(verdiPar?.tagName).toBe("DL");
    expect(verdiPar).toHaveClass("oppsummering_verdi_par");
    expect(verdiPar?.querySelector("dt")?.textContent).toBe("Saksbehandler: ");
    expect(verdiPar?.querySelector("dd")?.textContent).toBe("Ola Nordmann");
    expect(container.querySelector("button")).toBeInTheDocument();
  });

  it("viser «Ikke tildelt» og knappen når oppgaven er utildelt", () => {
    render({ tilordnetNavn: null, tilordnetMeg: false, kanTildeles: true });
    expect(screen.getByText("Ikke tildelt")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: KNAPP })).toBeInTheDocument();
  });

  it("viser navnet på annen saksbehandler og lar deg overta", () => {
    render({ tilordnetNavn: "Ola Nordmann", tilordnetMeg: false, kanTildeles: true });
    expect(screen.getByText("Ola Nordmann")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: KNAPP })).toBeInTheDocument();
  });

  it("skjuler knappen når behandlingen allerede er min", () => {
    render({ tilordnetNavn: "Lokal Testbruker", tilordnetMeg: true, kanTildeles: false });
    expect(screen.getByText("Lokal Testbruker")).toBeInTheDocument();
    expect(screen.queryByText("Meg")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: KNAPP })).not.toBeInTheDocument();
  });

  it("skjuler knappen når den er min, uavhengig av om navnet mangler", () => {
    render({ tilordnetNavn: null, tilordnetMeg: true, kanTildeles: false });
    expect(screen.queryByRole("button", { name: KNAPP })).not.toBeInTheDocument();
  });

  it("skjuler knappen på en avsluttet behandling som ikke er min", () => {
    render({ tilordnetNavn: "Ola Nordmann", tilordnetMeg: false, kanTildeles: false });
    expect(screen.getByText("Ola Nordmann")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: KNAPP })).not.toBeInTheDocument();
  });

  it("advarer i popupen om hvem man overtar fra, og kaller tildel ved bekreftelse", async () => {
    const bruker = userEvent.setup();
    render({ tilordnetNavn: "Ola Nordmann", tilordnetMeg: false, kanTildeles: true });

    await bruker.click(screen.getByRole("button", { name: KNAPP }));

    expect(screen.getByText(/allerede tildelt/)).toBeInTheDocument();
    expect(screen.getByText("Ola Nordmann", { selector: "strong" })).toBeInTheDocument();

    await bruker.click(screen.getByRole("button", { name: "Overta behandlingen" }));

    await waitFor(() => expect(tildel).toHaveBeenCalledWith({ behandlingID: 42 }));
  });

  it("sier i popupen at behandlingen er ledig når ingen har den", async () => {
    const bruker = userEvent.setup();
    render({ tilordnetNavn: null, tilordnetMeg: false, kanTildeles: true });

    await bruker.click(screen.getByRole("button", { name: KNAPP }));

    expect(screen.getByText(/ikke tildelt noen/)).toBeInTheDocument();
    expect(screen.queryByText(/allerede tildelt/)).not.toBeInTheDocument();
  });

  it("viser feilmelding når tildelingen feiler", async () => {
    const bruker = userEvent.setup();
    tildel.mockRejectedValue(new Error("Oppgaven ble nettopp tatt av en annen"));
    render({ tilordnetNavn: null, tilordnetMeg: false, kanTildeles: true });

    await bruker.click(screen.getByRole("button", { name: KNAPP }));
    await bruker.click(screen.getByRole("button", { name: "Ja, legg i mine oppgaver" }));

    expect(await screen.findByText("Oppgaven ble nettopp tatt av en annen")).toBeInTheDocument();
  });
  it("viser utilgjengelig tildeling uten knapp når oppgaven ikke kunne hentes", () => {
    render({ tildelingTilgjengelig: false, tilordnetNavn: null, tilordnetMeg: false, kanTildeles: false });
    expect(screen.getByText("Tildeling utilgjengelig")).toBeInTheDocument();
    expect(screen.queryByText("Ikke tildelt")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: KNAPP })).not.toBeInTheDocument();
  });

  it.each([
    ["Oppgaven finnes ikke lenger", "Oppgaven finnes ikke lenger"],
    ["", "Kunne ikke tildele oppgaven. Prøv igjen, eller oppdater siden."],
  ])("viser API-feiltekst eller norsk standardmelding: %s", async (message, forventet) => {
    const bruker = userEvent.setup();
    const feil = await sjekkStatuskode(
      new Response(JSON.stringify({ message }), {
        status: 409,
        statusText: "Conflict",
        headers: { "Content-Type": "application/json" },
      }),
    ).catch((error) => error);
    tildel.mockRejectedValue(feil);
    render({ tilordnetNavn: null, tilordnetMeg: false, kanTildeles: true });

    await bruker.click(screen.getByRole("button", { name: KNAPP }));
    await bruker.click(screen.getByRole("button", { name: "Ja, legg i mine oppgaver" }));

    expect(await screen.findByText(forventet)).toBeInTheDocument();
    expect(screen.queryByText("Conflict")).not.toBeInTheDocument();
  });
});
