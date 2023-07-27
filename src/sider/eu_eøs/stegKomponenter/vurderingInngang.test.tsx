import { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";

import { render, screen } from "@testing-library/react";

import MKV from "../../../melosyskodeverk";

import { Varsler, VurderingInngang } from "./vurderingInngang";

describe("Varsler", () => {
  const mockedProps = mock<ComponentProps<typeof Varsler>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
    props.landkoder = ["DK"];
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
      "Søknaden oppfyller inngangsvilkårene for EU/EØS-saker etter forordning 883/2004."
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
      screen.getByText("Søknaden oppfyller ikke inngangsvilkårene for EU/EØS-saker etter forordning 883/2004.")
    ).toBeInTheDocument();
    expect(screen.getByText(MKV.Terms.begrunnelser.inngangsvilkaar.MANGLER_STATSBORGERSKAP)).toBeInTheDocument();
    expect(screen.getByText(MKV.Terms.begrunnelser.inngangsvilkaar.TEKNISK_FEIL)).toBeInTheDocument();
    expect(
      screen.getByText("Hvis inngangsvilkår ikke er oppfylt, må du henlegge saken som bortfalt (i behandlingsmenyen).")
    ).toBeInTheDocument();
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
      screen.getByText("Søknaden oppfyller ikke inngangsvilkårene for EU/EØS-saker etter forordning 883/2004.")
    ).toBeInTheDocument();
    expect(screen.getByText(MKV.Terms.begrunnelser.inngangsvilkaar.TEKNISK_FEIL)).toBeInTheDocument();
    expect(
      screen.getByText("Hvis inngangsvilkår er oppfylt, kan du fortsette behandlingen som normalt.")
    ).toBeInTheDocument();
  });

  it("Viser feilmelding ved manglende inngangsvilkår", () => {
    props.inngangsvilkaar = undefined;
    props.behandlingHarPeriodeOgLand = true;

    render(<Varsler {...props} />);

    expect(screen.getByRole("listitem")).toHaveTextContent("Teknisk feil, finner ingen inngangsvilkår.");
  });

  it("Viser feilmelding ved manglende periode og land når det mangler", () => {
    props.inngangsvilkaar = undefined;
    props.behandlingHarPeriodeOgLand = false;

    render(<Varsler {...props} />);

    expect(screen.getByRole("listitem")).toHaveTextContent(
      "Det mangler periode og/eller land. Fyll disse inn i sidemenyen nedenfor og oppdater registeropplysninger."
    );
  });

  it("Viser feilmelding ved flere valgte land og ikke tema ARBEID_FLERE_LAND", async () => {
    props.oppfyllerInngangsvilkar = true;
    props.inngangsvilkaar = {
      vilkaar: MKV.Koder.vilkaar.FO_883_2004_INNGANGSVILKAAR,
      oppfylt: true,
      begrunnelseKoder: [],
      begrunnelseFritekst: null,
      begrunnelseFritekstEngelsk: null,
    };
    props.behandlingstema = MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER;
    props.landkoder = ["DK", "SE"];

    render(<Varsler {...props} />);

    expect(
      await screen.findByText(
        "Du har valgt et behandlingstema som kun tillater ett arbeidsland. Du må fjerne arbeidsland, eller endre behandlingstema for å kunne fatte vedtak."
      )
    ).toBeInTheDocument();
  });
});

describe("VurderingInngang", () => {
  const mockedProps = mock<ComponentProps<typeof VurderingInngang>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = {
      bekreftOgFortsett: vi.fn(),
      redigerbart: true,
      inngangsvilkaar: {
        vilkaar: MKV.Koder.vilkaar.FO_883_2004_INNGANGSVILKAAR,
        oppfylt: true,
        begrunnelseKoder: [],
        begrunnelseFritekst: "Begrunnelse",
        begrunnelseFritekstEngelsk: null,
      },
      oppfyllerInngangsvilkar: true,
      behandlingID: 1,
      hentVilkar: vi.fn(),
      landkoder: ["DK"],
      behandlingstema: MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND.kode,
      behandlingHarPeriodeOgLand: true,
    };
  });

  describe("knapp for å gå videre i stegvelger", () => {
    it("er ikke disabled dersom redigerbart er true", () => {
      render(<VurderingInngang {...props} />);

      expect(screen.getByRole("button", { name: "Bekreft og fortsett" })).not.toBeDisabled();
    });

    it("er disabled dersom redigerbart er false", () => {
      props.redigerbart = false;

      render(<VurderingInngang {...props} />);

      expect(screen.getByRole("button", { name: "Bekreft og fortsett" })).toBeDisabled();
    });
  });
});
