import { instance, mock } from "ts-mockito";
import { ComponentProps } from "react";
import Varsler from "./varsler";
import MKV from "../../../../melosyskodeverk";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../featuretoggle", () => ({
  useFeatureToggle: () => true,
}));

vi.mock(
  "../../../../felleskomponenter/menypanel/menypunkter/person/statsborgerskapTable/hentStatsborgerskap.generated",
  () => ({
    useHentStatsborgerskapQuery: () => ({
      data: {
        hentSaksopplysninger: {
          persondata: {
            statsborgerskap: [{ land: "NO" }],
          },
        },
      },
    }),
  }),
);

describe("Varsler", () => {
  const mockedProps = mock<ComponentProps<typeof Varsler>>();
  let props = instance(mockedProps);
  const konvensjonmelding =
    "Husk at du må vurdere om inngangsvilkårene i konvensjonen med Storbritannia av 30. juni 2023, eller separasjonsavtalen av 28. januar 2020, er oppfylt.";

  beforeEach(() => {
    props = instance(mockedProps);
    props.landkoder = ["DK"];
    props.behandlingID = 4;
  });

  it("Viser melding om oppfyllte inngangsvilkår", () => {
    props.oppfyllerInngangsvilkar = true;
    props.inngangsvilkaar = {
      vilkaar: MKV.Koder.vilkaar.FO_883_2004_INNGANGSVILKAAR,
      oppfylt: true,
      begrunnelseKoder: [],
      begrunnelseFritekst: null,
      begrunnelseFritekstEngelsk: null,
    };

    render(<Varsler {...props} />);

    expect(screen.getByRole("listitem")).toHaveTextContent(
      "Søknaden oppfyller inngangsvilkårene for EU/EØS-saker etter forordning 883/2004.",
    );
  });

  it("Viser feilmelding og hjelpetekst ved ikke oppfylte inngangsvilkår", () => {
    props.oppfyllerInngangsvilkar = false;
    props.inngangsvilkaar = {
      ...props.inngangsvilkaar,
      vilkaar: MKV.Koder.vilkaar.FO_883_2004_INNGANGSVILKAAR,
      oppfylt: true,
      begrunnelseFritekst: null,
      begrunnelseFritekstEngelsk: null,
      begrunnelseKoder: [
        MKV.Koder.begrunnelser.inngangsvilkaar.MANGLER_STATSBORGERSKAP,
        MKV.Koder.begrunnelser.inngangsvilkaar.TEKNISK_FEIL,
      ],
    };

    render(<Varsler {...props} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(
      screen.getByText("Søknaden oppfyller ikke inngangsvilkårene for EU/EØS-saker etter forordning 883/2004."),
    ).toBeInTheDocument();
    expect(screen.getByText(MKV.Terms.begrunnelser.inngangsvilkaar.MANGLER_STATSBORGERSKAP)).toBeInTheDocument();
    expect(screen.getByText(MKV.Terms.begrunnelser.inngangsvilkaar.TEKNISK_FEIL)).toBeInTheDocument();
    expect(screen.getByText("Du har to valg:")).toBeInTheDocument();
    expect(screen.queryByText(konvensjonmelding)).toBeNull();
  });

  it("Viser feilmelding og hjelpetekst ved overstyrte inngangsvilkår", () => {
    props.oppfyllerInngangsvilkar = true;
    props.inngangsvilkaar = {
      ...props.inngangsvilkaar,
      vilkaar: MKV.Koder.vilkaar.FO_883_2004_INNGANGSVILKAAR,
      oppfylt: true,
      begrunnelseFritekst: null,
      begrunnelseFritekstEngelsk: null,
      begrunnelseKoder: [
        MKV.Koder.begrunnelser.inngangsvilkaar.TEKNISK_FEIL,
        MKV.Koder.begrunnelser.inngangsvilkaar.OVERSTYRT_AV_SAKSBEHANDLER,
      ],
    };

    render(<Varsler {...props} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(
      screen.getByText("Søknaden oppfyller ikke inngangsvilkårene for EU/EØS-saker etter forordning 883/2004."),
    ).toBeInTheDocument();
    expect(screen.getByText(MKV.Terms.begrunnelser.inngangsvilkaar.TEKNISK_FEIL)).toBeInTheDocument();
    expect(screen.getByText("Du har to valg:")).toBeInTheDocument();
    expect(screen.queryByText(konvensjonmelding)).toBeNull();
  });

  it("Viser konvensjonmelding ved overstyrte inngangsvilkår når land er GB og toggle er på og er utsendt behtema", () => {
    props.oppfyllerInngangsvilkar = true;
    props.inngangsvilkaar = {
      ...props.inngangsvilkaar,
      vilkaar: MKV.Koder.vilkaar.FO_883_2004_INNGANGSVILKAAR,
      oppfylt: true,
      begrunnelseFritekst: null,
      begrunnelseFritekstEngelsk: null,
      begrunnelseKoder: [
        MKV.Koder.begrunnelser.inngangsvilkaar.TEKNISK_FEIL,
        MKV.Koder.begrunnelser.inngangsvilkaar.OVERSTYRT_AV_SAKSBEHANDLER,
      ],
    };
    props.behandlingstema = MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER;
    props.landkoder = ["GB"];

    render(<Varsler {...props} />);

    expect(screen.getByText(konvensjonmelding)).toBeInTheDocument();
  });

  it("Viser feilmelding ved manglende inngangsvilkår", () => {
    props.inngangsvilkaar = undefined;

    render(<Varsler {...props} />);

    expect(screen.getByRole("listitem")).toHaveTextContent("Teknisk feil, finner ingen inngangsvilkår.");
  });
});
