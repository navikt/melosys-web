import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";
import { Menypanel } from "./menypanel";
import MKV from "../../melosyskodeverk";

// Mock dependencies
vi.mock("./oppdaterRegisteropplysninger", () => ({
  default: () => <div>OppdaterRegisteropplysninger Mock</div>,
}));

vi.mock("../sidemeny", () => ({
  default: ({ heading, linkGroups, onClick }: any) => (
    <div>
      <div>{heading}</div>
      {linkGroups.map((group: any, gIndex: number) => (
        <div key={gIndex}>
          <div>{group.label}</div>
          {group.links.map((link: any, lIndex: number) => (
            <button key={lIndex} onClick={() => onClick(gIndex, lIndex)}>
              {link.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  ),
}));

vi.mock("./linkgroups", () => ({
  LinkGroupsFactory: {
    createLinkGroups: () => [
      {
        label: "Gruppe 1",
        links: [
          { label: "Link 1", content: <div>Content 1</div> },
          { label: "Link 2", content: <div>Content 2</div> },
        ],
      },
    ],
  },
}));

vi.mock("../../featuretoggle", () => ({
  useFeatureToggle: () => false,
}));

vi.mock("../../url", () => ({
  skalViseIngenFlyt: () => false,
  skalViseFullmektigFørPeriodeOgLand: () => false,
}));

describe("Menypanel", () => {
  const mockLagreSoknadOgOppfriskSaksopplysninger = vi.fn();

  const defaultProps = {
    sisteOpplysningerHentetDato: "2024-01-15",
    mottatteOpplysningerType: MKV.Koder.mottatteopplysningertyper.SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS,
    sakstype: MKV.Koder.sakstyper.EU_EOS,
    sakstema: null,
    behandlingstema: MKV.Koder.behandlinger.behandlingstema.UTSENDELSE,
    behandlingstype: MKV.Koder.behandlinger.behandlingstyper.UTSENDING_ARTIKKEL_17,
    menypanel: { synlig: false },
    redigerbart: true,
    lagreSoknadOgOppfriskSaksopplysninger: mockLagreSoknadOgOppfriskSaksopplysninger,
    visOppdaterRegisteropplysninger: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skal rendre menypanelet", () => {
    renderWithProviders(<Menypanel {...defaultProps} />, {
      preloadedState: {},
    });

    expect(screen.getByText("Opplysninger")).toBeInTheDocument();
  });

  it("skal vise OppdaterRegisteropplysninger når redigerbart er true", () => {
    renderWithProviders(<Menypanel {...defaultProps} />, {
      preloadedState: {},
    });

    expect(screen.getByText("OppdaterRegisteropplysninger Mock")).toBeInTheDocument();
  });

  it("skal ikke vise OppdaterRegisteropplysninger når redigerbart er false", () => {
    renderWithProviders(<Menypanel {...defaultProps} redigerbart={false} />, {
      preloadedState: {},
    });

    expect(screen.queryByText("OppdaterRegisteropplysninger Mock")).not.toBeInTheDocument();
  });

  it("skal ikke vise OppdaterRegisteropplysninger når visOppdaterRegisteropplysninger er false", () => {
    renderWithProviders(<Menypanel {...defaultProps} visOppdaterRegisteropplysninger={false} />, {
      preloadedState: {},
    });

    expect(screen.queryByText("OppdaterRegisteropplysninger Mock")).not.toBeInTheDocument();
  });

  it("skal ikke vise OppdaterRegisteropplysninger for årsavregning", () => {
    renderWithProviders(
      <Menypanel {...defaultProps} behandlingstype={MKV.Koder.behandlinger.behandlingstyper.ÅRSAVREGNING} />,
      {
        preloadedState: {},
      },
    );

    expect(screen.queryByText("OppdaterRegisteropplysninger Mock")).not.toBeInTheDocument();
  });

  it("skal ha CSS-klasse menypanel", () => {
    const { container } = renderWithProviders(<Menypanel {...defaultProps} />, {
      preloadedState: {},
    });

    expect(container.querySelector(".menypanel")).toBeInTheDocument();
  });

  it("skal vise link groups", () => {
    renderWithProviders(<Menypanel {...defaultProps} />, {
      preloadedState: {},
    });

    expect(screen.getByText("Gruppe 1")).toBeInTheDocument();
    expect(screen.getByText("Link 1")).toBeInTheDocument();
    expect(screen.getByText("Link 2")).toBeInTheDocument();
  });

  it("skal vise innhold for aktiv link", () => {
    renderWithProviders(<Menypanel {...defaultProps} />, {
      preloadedState: {},
    });

    // Content 1 skal vises som standard (første link)
    expect(screen.getByText("Content 1")).toBeInTheDocument();
  });

  it("skal bytte innhold når annen link klikkes", async () => {
    const user = userEvent.setup();

    renderWithProviders(<Menypanel {...defaultProps} />, {
      preloadedState: {},
    });

    // Klikk på Link 2
    const link2Button = screen.getByText("Link 2");
    await user.click(link2Button);

    // Content 2 skal nå vises
    expect(screen.getByText("Content 2")).toBeInTheDocument();
  });

  it("skal returnere null for sakstyper som ikke skal vise menypanel", () => {
    const { container } = renderWithProviders(
      <Menypanel {...defaultProps} sakstype={MKV.Koder.sakstyper.TRYGDEAVTALE} />,
      {
        preloadedState: {},
      },
    );

    // Komponenten skal returnere null for TRYGDEAVTALE uten menypanel.synlig
    expect(container.querySelector(".menypanel")).not.toBeInTheDocument();
  });

  it("skal håndtere menypanel.synlig = true", () => {
    renderWithProviders(<Menypanel {...defaultProps} menypanel={{ synlig: true }} />, {
      preloadedState: {},
    });

    expect(screen.getByText("Opplysninger")).toBeInTheDocument();
  });
});
