import { describe, it, expect, vi, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";

import OpprettSak from "./opprettSak";
import MKV from "../../melosyskodeverk";
import { renderWithProviders, renderWithProvidersAsync } from "../../ducks/test-utils/renderWithProviders";
import { reduxForm } from "redux-form";

vi.mock("../../services/modules/lovligekombinasjoner", async () => {
  const actual = await vi.importActual("../../services/modules/lovligekombinasjoner");
  return {
    ...actual,
    hentSakstyper: () =>
      Promise.resolve([
        { kode: "EU_EOS", term: "EU/EØS-land" },
        { kode: "TRYGDEAVTALE", term: "Avtaleland" },
      ]),
    hentSakstemaer: () =>
      Promise.resolve([
        { kode: "MEDLEMSKAP_LOVVALG", term: "Medlemskap og lovvalg" },
        { kode: "UNNTAK", term: "Unntak" },
      ]),
    hentBehandlingstemaer: () =>
      Promise.resolve([
        { kode: "YRKESAKTIV", term: "Yrkesaktiv" },
        { kode: "ANMODNING_OM_UNNTAK_HOVEDREGEL", term: "Anmodning om unntak" },
      ]),
    hentBehandlingstyper: () =>
      Promise.resolve([
        { kode: "FØRSTEGANG", term: "Førstegangsbehandling" },
        { kode: "NY_VURDERING", term: "Ny vurdering" },
      ]),
  };
});

const { BRUKER } = MKV.Koder.aktoersroller;
const { UTSENDT_ARBEIDSTAKER, UTSENDT_SELVSTENDIG, ARBEID_FLERE_LAND, ARBEID_NORGE_BOSATT_ANNET_LAND, YRKESAKTIV } =
  MKV.Koder.behandlinger.behandlingstema;

const WrappedOpprettSak = reduxForm({ form: "journalforing" })(OpprettSak as any);

interface OpprettSakProps {
  journalpostID: string;
  hoveddokumentID: string;
  vedlegg: any[];
  hentOgVisAvsender: () => void;
  hentOgVisBruker: () => void;
  hentOgVisVirksomhet: () => void;
  fagsakListe: any[];
  behandlingstemaer: any[];
  formValues: {
    saksnummer: string;
    avsenderType: string;
    journalforingGjelder: string;
    opprettBehandling: boolean;
    behandlingstema?: string;
    behandlingstype?: string;
    sakstema?: string;
    sakstype?: string;
    journalforingSoknadsland?: string;
    opprettnysak_behandlingstema?: string;
    opprettnysak_behandlingstype?: string;
  };
  feltNavn: {
    sakstype: string;
    sakstema: string;
    behandlingstema: string;
    opprettnysak_behandlingstema: string;
    behandlingstype: string;
    opprettnysak_behandlingstype: string;
    hovedpart: string;
    soknadsland: string;
    soknadslandFlereLandUkjentHvilke: string;
    periodeFraOgMed: string;
    periodeTilOgMed: string;
    formNavn: string;
  };
  formErrors: any;
  settFeltInnhold: () => void;
  settJournalforingHensikt: () => void;
  submitFailed: boolean;
  avbrytJournalforing: () => void;
  kanSubmittes: boolean;
  handleSubmit: () => void;
  submitJournalforing: () => void;
}

describe("OpprettSak - journalføring", () => {
  let props: OpprettSakProps;

  beforeEach(() => {
    props = {
      journalpostID: "1234",
      hoveddokumentID: "12345",
      vedlegg: [],
      hentOgVisAvsender: vi.fn(),
      hentOgVisBruker: vi.fn(),
      hentOgVisVirksomhet: vi.fn(),
      fagsakListe: [],
      behandlingstemaer: [],
      formValues: {
        saksnummer: "-1",
        avsenderType: "",
        journalforingGjelder: BRUKER,
        opprettBehandling: true,
      },
      feltNavn: {
        sakstype: "sakstype",
        sakstema: "sakstema",
        behandlingstema: "behandlingstema",
        opprettnysak_behandlingstema: "opprettnysak_behandlingstema",
        behandlingstype: "behandlingstype",
        opprettnysak_behandlingstype: "opprettnysak_behandlingstype",
        hovedpart: "journalforingGjelder",
        soknadsland: "journalforingSoknadsland",
        soknadslandFlereLandUkjentHvilke: "journalforingSoknadslandFlereLandUkjentHvilke",
        periodeFraOgMed: "journalforingPeriodeFraOgMed",
        periodeTilOgMed: "journalforingPeriodeTilOgMed",
        formNavn: "journalforing",
      },
      formErrors: {},
      settFeltInnhold: vi.fn(),
      settJournalforingHensikt: vi.fn(),
      submitFailed: false,
      avbrytJournalforing: vi.fn(),
      kanSubmittes: true,
      handleSubmit: vi.fn(),
      submitJournalforing: vi.fn(),
    };
  });

  it("Opprett Sak. Skal ha fra/til dato og liste over land", () => {
    const behandlingstemaer = [UTSENDT_SELVSTENDIG, UTSENDT_ARBEIDSTAKER, ARBEID_NORGE_BOSATT_ANNET_LAND];
    behandlingstemaer.forEach((behandlingstema) => {
      props.formValues.opprettnysak_behandlingstema = behandlingstema;
      props.formValues.opprettnysak_behandlingstype = MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG;
      props.formValues.sakstype = MKV.Koder.sakstyper.EU_EOS;
      props.formValues.sakstema = MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG;
      props.formValues.journalforingGjelder = MKV.Koder.aktoersroller.BRUKER;
      props.formValues.journalforingSoknadsland = behandlingstema;

      const { getByLabelText, queryByRole, getByRole } = renderWithProviders(<WrappedOpprettSak {...props} />);

      expect(getByLabelText("Fra")).toBeInTheDocument();
      expect(getByLabelText("Til")).toBeInTheDocument();
      expect(getByRole("combobox", { name: "I hvilke land skal arbeidet/næringen utføres i?" })).toBeInTheDocument(); // MultiSelect har tom label
      expect(queryByRole("radio")).not.toBeInTheDocument();

      cleanup(); // Må gjøre cleanup pga. flere render kall i en testmetode
    });
  });

  it("Opprett sak, skal ikke ha tilvalg", () => {
    const behandlingstemaer = [YRKESAKTIV];
    behandlingstemaer.forEach((behandlingstema) => {
      props.formValues.opprettnysak_behandlingstema = behandlingstema;
      props.formValues.sakstema = MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG;
      props.formValues.sakstype = MKV.Koder.sakstyper.TRYGDEAVTALE;
      props.formValues.journalforingGjelder = MKV.Koder.aktoersroller.BRUKER;

      const { queryByLabelText, queryByRole } = renderWithProviders(<WrappedOpprettSak {...props} />);

      expect(queryByLabelText("Fra")).not.toBeInTheDocument();
      expect(queryByLabelText("Til")).not.toBeInTheDocument();
      expect(
        queryByRole("combobox", { name: "I hvilke land skal arbeidet/næringen utføres i?" }),
      ).not.toBeInTheDocument();
      expect(queryByRole("radio")).not.toBeInTheDocument();

      cleanup(); // Må gjøre cleanup pga. flere render kall i en testmetode
    });
  });

  it("Opprett sak. Skal ha fra/til dato, valg av land, radio knapper", async () => {
    props.formValues.opprettnysak_behandlingstema = ARBEID_FLERE_LAND;
    props.formValues.opprettnysak_behandlingstype = MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG;
    props.formValues.journalforingSoknadsland = ARBEID_FLERE_LAND;
    props.formValues.sakstema = MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG;
    props.formValues.sakstype = MKV.Koder.sakstyper.EU_EOS;
    props.formValues.journalforingGjelder = MKV.Koder.aktoersroller.BRUKER;

    const { getByLabelText, getAllByRole, getByRole } = await renderWithProvidersAsync(
      <WrappedOpprettSak {...props} />,
    );

    expect(getByLabelText("Fra")).toBeInTheDocument();
    expect(getByLabelText("Til")).toBeInTheDocument();
    expect(getByRole("combobox", { name: "I hvilke land skal arbeidet/næringen utføres i?" })).toBeInTheDocument(); // MultiSelect har tom label
    expect(getAllByRole("radio")).toHaveLength(2);
  });
});

describe("OpprettSak - opprett ny sak", () => {
  let props: OpprettSakProps;

  beforeEach(() => {
    props = {
      journalpostID: "1234",
      hoveddokumentID: "12345",
      vedlegg: [],
      hentOgVisAvsender: vi.fn(),
      hentOgVisBruker: vi.fn(),
      hentOgVisVirksomhet: vi.fn(),
      fagsakListe: [],
      behandlingstemaer: [],
      formValues: {
        saksnummer: "-1",
        avsenderType: "",
        journalforingGjelder: BRUKER,
        opprettBehandling: true,
      },
      feltNavn: {
        sakstype: "sakstype",
        sakstema: "sakstema",
        behandlingstema: "behandlingstema",
        opprettnysak_behandlingstema: "behandlingstema",
        behandlingstype: "behandlingstype",
        opprettnysak_behandlingstype: "behandlingstype",
        soknadsland: "soknadsland",
        soknadslandFlereLandUkjentHvilke: "soknadslandFlereLandUkjentHvilke",
        periodeFraOgMed: "periodeFraOgMed",
        periodeTilOgMed: "periodeTilOgMed",
        hovedpart: "hovedpart",
        formNavn: "opprett_ny_sak",
      },
      formErrors: {},
      settFeltInnhold: vi.fn(),
      settJournalforingHensikt: vi.fn(),
      submitFailed: false,
      avbrytJournalforing: vi.fn(),
      kanSubmittes: true,
      handleSubmit: vi.fn(),
      submitJournalforing: vi.fn(),
    };
  });

  it("Opprett Sak. Skal ha fra/til dato og liste over land", () => {
    const behandlingstemaer = [UTSENDT_SELVSTENDIG, UTSENDT_ARBEIDSTAKER, ARBEID_NORGE_BOSATT_ANNET_LAND];
    behandlingstemaer.forEach((behandlingstema) => {
      props.formValues.behandlingstema = behandlingstema;
      props.formValues.behandlingstype = MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG;
      props.formValues.sakstema = MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG;
      props.formValues.sakstype = MKV.Koder.sakstyper.EU_EOS;
      props.formValues.journalforingGjelder = MKV.Koder.aktoersroller.BRUKER;
      props.formValues.journalforingSoknadsland = behandlingstema;

      const { getByLabelText, queryByRole, getByRole } = renderWithProviders(<WrappedOpprettSak {...props} />);

      expect(getByLabelText("Fra")).toBeInTheDocument();
      expect(getByLabelText("Til")).toBeInTheDocument();
      expect(getByRole("combobox", { name: "I hvilke land skal arbeidet/næringen utføres i?" })).toBeInTheDocument(); // MultiSelect har tom label
      expect(queryByRole("radio")).not.toBeInTheDocument();

      cleanup(); // Må gjøre cleanup pga. flere render kall i en testmetode
    });
  });

  it("Opprett sak, skal ikke ha tilvalg", () => {
    const behandlingstemaer = [YRKESAKTIV];
    behandlingstemaer.forEach((behandlingstema) => {
      props.formValues.behandlingstema = behandlingstema;
      props.formValues.sakstema = MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG;
      props.formValues.sakstype = MKV.Koder.sakstyper.TRYGDEAVTALE;
      props.formValues.journalforingGjelder = MKV.Koder.aktoersroller.BRUKER;

      const { queryByLabelText, queryByRole } = renderWithProviders(<WrappedOpprettSak {...props} />);

      expect(queryByLabelText("Fra")).not.toBeInTheDocument();
      expect(queryByLabelText("Til")).not.toBeInTheDocument();
      expect(queryByRole("textbox", { name: "" })).not.toBeInTheDocument();
      expect(queryByRole("radio")).not.toBeInTheDocument();

      cleanup(); // Må gjøre cleanup pga. flere render kall i en testmetode
    });
  });

  it("Opprett sak. Skal ha fra/til dato, valg av land, radio knapper", async () => {
    props.formValues.behandlingstema = ARBEID_FLERE_LAND;
    props.formValues.behandlingstype = MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG;
    props.formValues.journalforingSoknadsland = ARBEID_FLERE_LAND;
    props.formValues.sakstema = MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG;
    props.formValues.sakstype = MKV.Koder.sakstyper.EU_EOS;
    props.formValues.journalforingGjelder = MKV.Koder.aktoersroller.BRUKER;

    const { getByLabelText, getAllByRole, getByRole } = await renderWithProvidersAsync(
      <WrappedOpprettSak {...props} />,
    );

    expect(getByLabelText("Fra")).toBeInTheDocument();
    expect(getByLabelText("Til")).toBeInTheDocument();
    expect(getByRole("combobox", { name: "I hvilke land skal arbeidet/næringen utføres i?" })).toBeInTheDocument(); // MultiSelect har tom label
    expect(getAllByRole("radio")).toHaveLength(2);
  });
});
