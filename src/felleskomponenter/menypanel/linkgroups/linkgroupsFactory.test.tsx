import { describe, it, expect, vi, beforeEach } from "vitest";
import MKV from "../../../melosyskodeverk";
import LinkGroupsFactory from "./linkgroupsFactory";
import { ContentProps } from "./types";
import { MELOSYS_VIS_PENSJONSOPPTJENING_POPP } from "../../../featuretoggle/toggleNavn";

// Mock React components to avoid rendering issues
vi.mock("../menypunkter", () => ({
  ArbeidsforholdOgInntekt: () => null,
  ArbeidsgiverOgVirksomhet: () => null,
  Arbeidssteder: () => null,
  Fullmektig: () => null,
  Medlemskap: () => null,
  Utenlandsoppdraget: () => null,
  Periode: () => null,
  Person: () => null,
  Familieforhold: () => null,
  LonnOgGodtgjorelser: () => null,
  OvrigOmArbeidstaker: () => null,
  VirksomhetenINorge: () => null,
}));

vi.mock("../menypunkter/fakturainformasjon", () => ({
  default: () => null,
}));

vi.mock("../../pensjonsopptjening", () => ({
  default: () => null,
}));

const { useFeatureToggleMock } = vi.hoisted(() => ({
  useFeatureToggleMock: vi.fn<(name: string) => boolean>(() => false),
}));

vi.mock("../../../featuretoggle", () => ({
  useFeatureToggle: (name: string) => useFeatureToggleMock(name),
}));

vi.mock("../../../url", () => ({
  harUnntaksregistreringFlyt: () => false,
  skalViseIngenFlyt: () => false,
}));

const { UTSENDT_ARBEIDSTAKER, BESLUTNING_LOVVALG_NORGE, YRKESAKTIV, PENSJONIST, IKKE_YRKESAKTIV } =
  MKV.Koder.behandlinger.behandlingstema;

const { ÅRSAVREGNING, SØKNAD } = MKV.Koder.behandlinger.behandlingstyper;

const { SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS } = MKV.Koder.mottatteopplysningertyper;

const createContentProps = (behandlingstema = UTSENDT_ARBEIDSTAKER): ContentProps => ({
  visArbeidsforholdRolleEtiketter: false,
  redigerbart: true,
  visMottatteOpplysningerData: true,
  lagreSoknadOgOppfriskSaksopplysninger: vi.fn(),
  behandlingstema,
  endreFokus: false,
});

type ConfigOverrides = {
  behandlingstema?: string;
  behandlingstype?: string;
  sakstype?: string;
  mottatteOpplysningerType?: string;
  contentProps?: ContentProps;
  sakstema?: string;
  kunFullmektig?: boolean;
  erPensjonistToggleEnabled?: boolean;
  erPensjonistEØSToggleEnabled?: boolean;
};

const createConfig = (overrides: ConfigOverrides = {}) => {
  const behandlingstema = overrides.behandlingstema ?? UTSENDT_ARBEIDSTAKER;
  return {
    sakstype: MKV.Koder.sakstyper.EU_EOS,
    behandlingstema,
    behandlingstype: SØKNAD,
    mottatteOpplysningerType: SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS,
    contentProps: createContentProps(behandlingstema),
    sakstema: "",
    kunFullmektig: false,
    erPensjonistToggleEnabled: false,
    erPensjonistEØSToggleEnabled: false,
    ...overrides,
  };
};

const getAllLabels = (linkGroups: ReturnType<typeof LinkGroupsFactory.createLinkGroups>) =>
  linkGroups.flatMap((g) => g.links).map((l) => l.label);

describe("LinkGroupsFactory", () => {
  beforeEach(() => {
    useFeatureToggleMock.mockReset();
    useFeatureToggleMock.mockReturnValue(false);
  });

  describe("ved årsavregning", () => {
    it("skal IKKE inkludere Arbeidsgiver/virksomhet for UTSENDT_ARBEIDSTAKER", () => {
      const config = createConfig({
        behandlingstype: ÅRSAVREGNING,
        behandlingstema: UTSENDT_ARBEIDSTAKER,
      });

      const linkGroups = LinkGroupsFactory.createLinkGroups(config);
      const allLabels = getAllLabels(linkGroups);

      expect(allLabels).not.toContain("Arbeidsgiver/virksomhet");
    });

    it("skal IKKE inkludere Arbeidssted(er) for UTSENDT_ARBEIDSTAKER", () => {
      const config = createConfig({
        behandlingstype: ÅRSAVREGNING,
        behandlingstema: UTSENDT_ARBEIDSTAKER,
      });

      const linkGroups = LinkGroupsFactory.createLinkGroups(config);
      const allLabels = getAllLabels(linkGroups);

      expect(allLabels).not.toContain("Arbeidssted(er)");
    });

    it("skal IKKE inkludere Arbeidsgiver/virksomhet for YRKESAKTIV", () => {
      const config = createConfig({
        behandlingstype: ÅRSAVREGNING,
        behandlingstema: YRKESAKTIV,
      });

      const linkGroups = LinkGroupsFactory.createLinkGroups(config);
      const allLabels = getAllLabels(linkGroups);

      expect(allLabels).not.toContain("Arbeidsgiver/virksomhet");
    });

    it("skal IKKE inkludere Arbeidssted(er) for YRKESAKTIV", () => {
      const config = createConfig({
        behandlingstype: ÅRSAVREGNING,
        behandlingstema: YRKESAKTIV,
      });

      const linkGroups = LinkGroupsFactory.createLinkGroups(config);
      const allLabels = getAllLabels(linkGroups);

      expect(allLabels).not.toContain("Arbeidssted(er)");
    });

    it("skal fortsatt inkludere Fullmektig ved årsavregning", () => {
      const config = createConfig({
        behandlingstype: ÅRSAVREGNING,
        behandlingstema: UTSENDT_ARBEIDSTAKER,
      });

      const linkGroups = LinkGroupsFactory.createLinkGroups(config);
      const allLabels = getAllLabels(linkGroups);

      expect(allLabels).toContain("Fullmektig");
    });
  });

  describe("ved vanlig søknadsbehandling", () => {
    it("skal inkludere Arbeidsgiver/virksomhet for UTSENDT_ARBEIDSTAKER", () => {
      const config = createConfig({
        behandlingstype: SØKNAD,
        behandlingstema: UTSENDT_ARBEIDSTAKER,
      });

      const linkGroups = LinkGroupsFactory.createLinkGroups(config);
      const allLabels = getAllLabels(linkGroups);

      expect(allLabels).toContain("Arbeidsgiver/virksomhet");
    });

    it("skal inkludere Arbeidssted(er) for UTSENDT_ARBEIDSTAKER", () => {
      const config = createConfig({
        behandlingstype: SØKNAD,
        behandlingstema: UTSENDT_ARBEIDSTAKER,
      });

      const linkGroups = LinkGroupsFactory.createLinkGroups(config);
      const allLabels = getAllLabels(linkGroups);

      expect(allLabels).toContain("Arbeidssted(er)");
    });

    it("skal inkludere Arbeidssted(er) for YRKESAKTIV", () => {
      const config = createConfig({
        behandlingstype: SØKNAD,
        behandlingstema: YRKESAKTIV,
      });

      const linkGroups = LinkGroupsFactory.createLinkGroups(config);
      const allLabels = getAllLabels(linkGroups);

      expect(allLabels).toContain("Arbeidssted(er)");
    });
  });

  describe("Pensjonsopptjening-menypunkt", () => {
    const enablePensjonsopptjening = () => {
      useFeatureToggleMock.mockImplementation((name) => name === MELOSYS_VIS_PENSJONSOPPTJENING_POPP);
    };

    it("inkluderes for UTSENDT_ARBEIDSTAKER ved årsavregning når toggle er på", () => {
      enablePensjonsopptjening();
      const config = createConfig({ behandlingstype: ÅRSAVREGNING, behandlingstema: UTSENDT_ARBEIDSTAKER });
      const linkGroups = LinkGroupsFactory.createLinkGroups(config);
      const fraRegister = linkGroups.find((g) => g.label === "FRA REGISTER");
      expect(fraRegister?.links.map((l) => l.label)).toContain("Pensjonsopptjening");
    });

    it("inkluderes for YRKESAKTIV ved årsavregning når toggle er på", () => {
      enablePensjonsopptjening();
      const config = createConfig({ behandlingstype: ÅRSAVREGNING, behandlingstema: YRKESAKTIV });
      const linkGroups = LinkGroupsFactory.createLinkGroups(config);
      const fraRegister = linkGroups.find((g) => g.label === "FRA REGISTER");
      expect(fraRegister?.links.map((l) => l.label)).toContain("Pensjonsopptjening");
    });

    it("inkluderes for PENSJONIST ved årsavregning når toggle er på", () => {
      enablePensjonsopptjening();
      const config = createConfig({ behandlingstype: ÅRSAVREGNING, behandlingstema: PENSJONIST });
      const linkGroups = LinkGroupsFactory.createLinkGroups(config);
      const fraRegister = linkGroups.find((g) => g.label === "FRA REGISTER");
      expect(fraRegister?.links.map((l) => l.label)).toContain("Pensjonsopptjening");
    });

    it("inkluderes for IKKE_YRKESAKTIV ved årsavregning når toggle er på", () => {
      enablePensjonsopptjening();
      const config = createConfig({ behandlingstype: ÅRSAVREGNING, behandlingstema: IKKE_YRKESAKTIV });
      const linkGroups = LinkGroupsFactory.createLinkGroups(config);
      const fraRegister = linkGroups.find((g) => g.label === "FRA REGISTER");
      expect(fraRegister?.links.map((l) => l.label)).toContain("Pensjonsopptjening");
    });

    it("inkluderes IKKE når toggle er av", () => {
      const config = createConfig({ behandlingstype: ÅRSAVREGNING, behandlingstema: UTSENDT_ARBEIDSTAKER });
      const linkGroups = LinkGroupsFactory.createLinkGroups(config);
      expect(getAllLabels(linkGroups)).not.toContain("Pensjonsopptjening");
    });

    it("inkluderes IKKE for vanlig SØKNAD selv om toggle er på", () => {
      enablePensjonsopptjening();
      const config = createConfig({ behandlingstype: SØKNAD, behandlingstema: UTSENDT_ARBEIDSTAKER });
      const linkGroups = LinkGroupsFactory.createLinkGroups(config);
      expect(getAllLabels(linkGroups)).not.toContain("Pensjonsopptjening");
    });
  });

  describe("BESLUTNING_LOVVALG_NORGE ved vanlig søknadsbehandling", () => {
    it("skal inkludere Arbeidsgiver/virksomhet", () => {
      const config = createConfig({
        behandlingstype: SØKNAD,
        behandlingstema: BESLUTNING_LOVVALG_NORGE,
      });

      const linkGroups = LinkGroupsFactory.createLinkGroups(config);
      const allLabels = getAllLabels(linkGroups);

      expect(allLabels).toContain("Arbeidsgiver/virksomhet");
    });

    it("skal inkludere Arbeidssted(er)", () => {
      const config = createConfig({
        behandlingstype: SØKNAD,
        behandlingstema: BESLUTNING_LOVVALG_NORGE,
      });

      const linkGroups = LinkGroupsFactory.createLinkGroups(config);
      const allLabels = getAllLabels(linkGroups);

      expect(allLabels).toContain("Arbeidssted(er)");
    });

    it("skal inkludere Fullmektig", () => {
      const config = createConfig({
        behandlingstype: SØKNAD,
        behandlingstema: BESLUTNING_LOVVALG_NORGE,
      });

      const linkGroups = LinkGroupsFactory.createLinkGroups(config);
      const allLabels = getAllLabels(linkGroups);

      expect(allLabels).toContain("Fullmektig");
    });

    it("skal inkludere Periode og land", () => {
      const config = createConfig({
        behandlingstype: SØKNAD,
        behandlingstema: BESLUTNING_LOVVALG_NORGE,
      });

      const linkGroups = LinkGroupsFactory.createLinkGroups(config);
      const allLabels = getAllLabels(linkGroups);

      expect(allLabels).toContain("Periode og land");
    });
  });
});
