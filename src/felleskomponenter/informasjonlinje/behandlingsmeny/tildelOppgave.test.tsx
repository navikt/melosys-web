import { vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";
import TildelOppgave from "./tildelOppgave";
import sjekkStatuskode from "../../../services/sjekkStatuskode";

const KNAPP = "Til min oppgaveliste";

const tildel = vi.fn();
const hentBehandling = vi.fn();
let toggleEnabled: boolean | undefined = true;

vi.mock("../../../services/api", () => ({
  Oppgaver: {
    tildel: (...args: unknown[]) => tildel(...args),
  },
}));

vi.mock("../../../featuretoggle", () => ({
  useFeatureToggle: () => toggleEnabled,
}));

vi.mock("../../../ducks/behandlinger", async () => {
  const faktisk = await vi.importActual<typeof import("../../../ducks/behandlinger")>("../../../ducks/behandlinger");
  return {
    ...faktisk,
    behandlingerOperations: {
      ...faktisk.behandlingerOperations,
      oppfriskBehandling: () => hentBehandling,
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
    hentBehandling.mockResolvedValue(undefined);
  });

  it("viser ingenting når toggelen er av", () => {
    toggleEnabled = false;
    const { container } = render({ tilordnetNavn: null, tilordnetMeg: false, kanTildeles: true });
    expect(container).toBeEmptyDOMElement();
  });

  it("viser knappen når oppgaven er utildelt", () => {
    render({ tilordnetNavn: null, tilordnetMeg: false, kanTildeles: true });
    expect(screen.getByRole("button", { name: KNAPP })).toBeInTheDocument();
  });

  it("viser knappen når oppgaven er tildelt en annen", () => {
    render({
      tilordnetIdent: "Z111111",
      tilordnetNavn: "Ola Nordmann",
      tilordnetMeg: false,
      kanTildeles: true,
    });
    expect(screen.getByRole("button", { name: KNAPP })).toBeInTheDocument();
  });

  it("viser grått menyvalg uten handling når behandlingen allerede er min", async () => {
    render({ tilordnetNavn: "Lokal Testbruker", tilordnetMeg: true, kanTildeles: false });
    expect(screen.getByText(KNAPP)).toHaveClass("behandlingsmeny__handling__tekst-disabled");
    await userEvent.click(screen.getByText(KNAPP));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(tildel).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: KNAPP })).not.toBeInTheDocument();
  });

  it("viser deaktivert menyvalg også når eget navn mangler", () => {
    render({ tilordnetNavn: null, tilordnetMeg: true, kanTildeles: false });
    expect(screen.getByText(KNAPP)).toHaveClass("behandlingsmeny__handling__tekst-disabled");
    expect(screen.queryByRole("button", { name: KNAPP })).not.toBeInTheDocument();
  });

  it("skjuler knappen på en avsluttet behandling som ikke er min", () => {
    render({ tilordnetNavn: "Ola Nordmann", tilordnetMeg: false, kanTildeles: false });
    expect(screen.queryByRole("button", { name: KNAPP })).not.toBeInTheDocument();
  });

  it("advarer i popupen om hvem man overtar fra, og kaller tildel ved bekreftelse", async () => {
    const bruker = userEvent.setup();
    render({
      tilordnetIdent: "Z111111",
      tilordnetNavn: "Ola Nordmann",
      tilordnetMeg: false,
      kanTildeles: true,
    });

    await bruker.click(screen.getByRole("button", { name: KNAPP }));

    expect(screen.getByText(/allerede tildelt/)).toBeInTheDocument();
    expect(screen.getByText("Ola Nordmann", { selector: "strong" })).toBeInTheDocument();

    await bruker.click(screen.getByRole("button", { name: "Overta behandlingen" }));

    await waitFor(() => expect(tildel).toHaveBeenCalledWith({ behandlingID: 42, forventetTilordnetIdent: "Z111111" }));
    expect(hentBehandling).toHaveBeenCalledOnce();
  });

  it("sier i popupen at behandlingen er ledig når ingen har den", async () => {
    const bruker = userEvent.setup();
    render({ tilordnetNavn: null, tilordnetMeg: false, kanTildeles: true });

    await bruker.click(screen.getByRole("button", { name: KNAPP }));

    expect(screen.getByText(/ikke tildelt noen/)).toBeInTheDocument();
    expect(screen.queryByText(/allerede tildelt/)).not.toBeInTheDocument();
  });

  it("viser standardmelding, ikke teknisk feiltekst, når svaret ikke er JSON", async () => {
    // sjekkStatuskode gjør response.clone().json() på alt som ikke er 2xx, så en 502 med
    // HTML fra en proxy kaster SyntaxError i stedet for ApiError. Da må vi vise vår egen
    // melding, ikke «Unexpected token < in JSON».
    const bruker = userEvent.setup();
    const feil = await sjekkStatuskode(
      new Response("<html>502 Bad Gateway</html>", {
        status: 502,
        statusText: "Bad Gateway",
        headers: { "Content-Type": "text/html" },
      }),
    ).catch((error) => error);
    tildel.mockRejectedValue(feil);
    render({ tilordnetNavn: null, tilordnetMeg: false, kanTildeles: true });

    await bruker.click(screen.getByRole("button", { name: KNAPP }));
    await bruker.click(screen.getByRole("button", { name: "Ja, legg i mine oppgaver" }));

    expect(
      await screen.findByText("Kunne ikke tildele oppgaven. Prøv igjen, eller oppdater siden."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/JSON/)).not.toBeInTheDocument();
  });

  it("frisker opp behandlingen også når tildelingen feiler, så nytt forsøk ikke sender utdatert ident", async () => {
    const bruker = userEvent.setup();
    tildel.mockRejectedValue(new Error("Konflikt"));
    render({ tilordnetIdent: "Z999999", tilordnetNavn: "Ola Nordmann", tilordnetMeg: false, kanTildeles: true });

    await bruker.click(screen.getByRole("button", { name: KNAPP }));
    await bruker.click(screen.getByRole("button", { name: "Overta behandlingen" }));

    expect(
      await screen.findByText("Kunne ikke tildele oppgaven. Prøv igjen, eller oppdater siden."),
    ).toBeInTheDocument();
    expect(hentBehandling).toHaveBeenCalledOnce();
  });

  it("lar seg ikke lukke mens tildelingen pågår", async () => {
    const bruker = userEvent.setup();
    let fullfør: () => void = () => {};
    tildel.mockImplementation(() => new Promise<void>((resolve) => (fullfør = resolve)));
    render({ tilordnetNavn: null, tilordnetMeg: false, kanTildeles: true });

    await bruker.click(screen.getByRole("button", { name: KNAPP }));
    await bruker.click(screen.getByRole("button", { name: "Ja, legg i mine oppgaver" }));

    await bruker.keyboard("{Escape}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fullfør();
  });

  it("beholder dialogen og viser feil når oppfriskningen feiler etter vellykket tildeling", async () => {
    const bruker = userEvent.setup();
    hentBehandling.mockRejectedValue(new Error("Kunne ikke hente behandling"));
    render({ tilordnetIdent: null, tilordnetNavn: null, tilordnetMeg: false, kanTildeles: true });

    await bruker.click(screen.getByRole("button", { name: KNAPP }));
    await bruker.click(screen.getByRole("button", { name: "Ja, legg i mine oppgaver" }));

    expect(
      await screen.findByText("Oppgaven ble tildelt, men siden kunne ikke oppdateres. Oppdater siden og prøv igjen."),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
  it("skjuler knappen når oppgaven ikke kunne hentes", () => {
    render({ tildelingTilgjengelig: false, tilordnetNavn: null, tilordnetMeg: false, kanTildeles: false });
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
