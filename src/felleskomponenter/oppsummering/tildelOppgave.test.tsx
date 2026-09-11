import { vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";
import TildelOppgave from "./tildelOppgave";

const MIN_IDENT = "Z999999";

const tildel = vi.fn();
const hentBehandling = vi.fn();
let toggleEnabled: boolean | undefined = true;
let innloggetIdent: string | null = MIN_IDENT;

vi.mock("../../services/api", () => ({
  Oppgaver: {
    tildel: (...args: unknown[]) => tildel(...args),
  },
}));

vi.mock("@azure/msal-react", () => ({
  useMsal: () => ({
    accounts: innloggetIdent ? [{ idTokenClaims: { NAVident: innloggetIdent } }] : [],
  }),
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
    preloadedState: { behandlinger: { data: { behandlingID: 42, ...behandlingData } } },
  });

describe("TildelOppgave", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    toggleEnabled = true;
    innloggetIdent = MIN_IDENT;
    tildel.mockResolvedValue(undefined);
  });

  it("viser ingenting når toggelen er av", () => {
    toggleEnabled = false;
    const { container } = render({ tilordnetIdent: null, tilordnetNavn: null });
    expect(container).toBeEmptyDOMElement();
  });

  it("viser «Ikke tildelt» og knappen når oppgaven er utildelt", () => {
    render({ tilordnetIdent: null, tilordnetNavn: null });
    expect(screen.getByText("Ikke tildelt")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Legg oppgaven i min benk" })).toBeInTheDocument();
  });

  it("viser navnet på annen saksbehandler og lar deg overta", () => {
    render({ tilordnetIdent: "Z111111", tilordnetNavn: "Ola Nordmann" });
    expect(screen.getByText("Ola Nordmann")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Legg oppgaven i min benk" })).toBeInTheDocument();
  });

  it("skjuler knappen når oppgaven allerede er min", () => {
    render({ tilordnetIdent: MIN_IDENT, tilordnetNavn: "Kari Nordmann" });
    expect(screen.getByText("Meg")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Legg oppgaven i min benk" })).not.toBeInTheDocument();
  });

  it("advarer i popupen om hvem man overtar fra, og kaller tildel ved bekreftelse", async () => {
    const bruker = userEvent.setup();
    render({ tilordnetIdent: "Z111111", tilordnetNavn: "Ola Nordmann" });

    await bruker.click(screen.getByRole("button", { name: "Legg oppgaven i min benk" }));

    expect(screen.getByText(/allerede tildelt/)).toBeInTheDocument();
    expect(screen.getByText("Ola Nordmann", { selector: "strong" })).toBeInTheDocument();

    await bruker.click(screen.getByRole("button", { name: "Overta oppgaven" }));

    await waitFor(() => expect(tildel).toHaveBeenCalledWith({ behandlingID: 42 }));
  });

  it("sier i popupen at oppgaven er ledig når ingen har den", async () => {
    const bruker = userEvent.setup();
    render({ tilordnetIdent: null, tilordnetNavn: null });

    await bruker.click(screen.getByRole("button", { name: "Legg oppgaven i min benk" }));

    expect(screen.getByText(/ikke tildelt noen/)).toBeInTheDocument();
    expect(screen.queryByText(/allerede tildelt/)).not.toBeInTheDocument();
  });

  it("viser feilmelding når tildelingen feiler", async () => {
    const bruker = userEvent.setup();
    tildel.mockRejectedValue(new Error("Oppgaven ble nettopp tatt av en annen"));
    render({ tilordnetIdent: null, tilordnetNavn: null });

    await bruker.click(screen.getByRole("button", { name: "Legg oppgaven i min benk" }));
    await bruker.click(screen.getByRole("button", { name: "Ja, legg i min benk" }));

    expect(await screen.findByText("Oppgaven ble nettopp tatt av en annen")).toBeInTheDocument();
  });
});
