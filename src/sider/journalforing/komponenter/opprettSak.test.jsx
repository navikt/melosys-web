import { OpprettSak } from "./opprettSak";
import * as Skjema from "../../../felleskomponenter/skjema";
import MultiSelect from "../../../felleskomponenter/skjema/input/multiselect";

import MKV from "../../../melosyskodeverk";

const { BRUKER } = MKV.Koder.aktoersroller;
const {
  UTSENDT_ARBEIDSTAKER,
  UTSENDT_SELVSTENDIG,
  ARBEID_FLERE_LAND,
  ARBEID_NORGE_BOSATT_ANNET_LAND,
  ARBEID_I_UTLANDET,
  YRKESAKTIV,
} = MKV.Koder.behandlinger.behandlingstema;

describe("OpprettSak - journalføring", () => {
  let props = null;

  beforeEach(() => {
    props = {
      journalpostID: "1234",
      hoveddokumentID: "12345",
      vedlegg: [],
      hentOgVisAvsender: jest.fn(),
      hentOgVisBruker: jest.fn(),
      hentOgVisVirksomhet: jest.fn(),
      fagsakListe: [],
      hentOgVisRepresentant: jest.fn(),
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
        soknadslandUkjenteEllerAlleEosLand: "journalforingSoknadslandUkjenteEllerAlleEosLand",
        periodeFraOgMed: "journalforingPeriodeFraOgMed",
        periodeTilOgMed: "journalforingPeriodeTilOgMed",
        formNavn: "journalforing",
      },
      formErrors: {},
      settFeltInnhold: jest.fn(),
      settJournalforingHensikt: jest.fn(),
      submitFailed: false,
      avbrytJournalforing: jest.fn(),
      kanSubmittes: true,
      handleSubmit: jest.fn(),
      submitJournalforing: jest.fn(),
    };
  });

  each([UTSENDT_SELVSTENDIG, UTSENDT_ARBEIDSTAKER, ARBEID_NORGE_BOSATT_ANNET_LAND]).it(
    `Opprett Sak. Skal ha fra/til dato og liste over land`,
    (behandlingstema) => {
      props.formValues.opprettnysak_behandlingstema = behandlingstema;
      props.formValues.opprettnysak_behandlingstype = MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG;
      props.formValues.sakstype = MKV.Koder.sakstyper.EU_EOS;
      props.formValues.sakstema = MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG;
      props.formValues.journalforingGjelder = MKV.Koder.aktoersroller.BRUKER;

      props.formValues.journalforingSoknadsland = behandlingstema;
      const opprettSak = shallow(<OpprettSak {...props} />);

      const datovelger = opprettSak.find(Skjema.Datovelger);
      const radioKnapper = opprettSak.find(Skjema.Radio);
      const multiselect = opprettSak.find(MultiSelect);

      expect(datovelger).toHaveLength(2);
      expect(radioKnapper).toHaveLength(0);
      expect(multiselect).toHaveLength(1);
    }
  );

  each([ARBEID_I_UTLANDET, YRKESAKTIV]).it(`Opprett sak, skal ikke ha tilvalg`, (behandlingstema) => {
    props.formValues.opprettnysak_behandlingstema = behandlingstema;
    props.formValues.sakstema = MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG;
    props.formValues.sakstype = MKV.Koder.sakstyper.TRYGDEAVTALE;
    props.formValues.journalforingGjelder = MKV.Koder.aktoersroller.BRUKER;

    const opprettSak = shallow(<OpprettSak {...props} />);
    const datovelger = opprettSak.find(Skjema.Datovelger);
    const radioKnapper = opprettSak.find(Skjema.Radio);
    const multiselect = opprettSak.find(MultiSelect);

    expect(datovelger).toHaveLength(0);
    expect(radioKnapper).toHaveLength(0);
    expect(multiselect).toHaveLength(0);
  });

  it(`Opprett sak. Skal ha fra/til dato, valg av land, radio knapper`, () => {
    props.formValues.opprettnysak_behandlingstema = ARBEID_FLERE_LAND;
    props.formValues.opprettnysak_behandlingstype = MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG;
    props.formValues.journalforingSoknadsland = ARBEID_FLERE_LAND;
    props.formValues.sakstema = MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG;
    props.formValues.sakstype = MKV.Koder.sakstyper.EU_EOS;
    props.formValues.journalforingGjelder = MKV.Koder.aktoersroller.BRUKER;

    const opprettSak = shallow(<OpprettSak {...props} />);
    const datovelger = opprettSak.find(Skjema.Datovelger);
    const radioKnapper = opprettSak.find(Skjema.Radio);
    const multiselect = opprettSak.find(MultiSelect);

    expect(datovelger).toHaveLength(2);
    expect(radioKnapper).toHaveLength(2);
    expect(multiselect).toHaveLength(1);
  });
});

describe("OpprettSak - opprett ny sak", () => {
  let props = null;

  beforeEach(() => {
    props = {
      journalpostID: "1234",
      hoveddokumentID: "12345",
      vedlegg: [],
      hentOgVisAvsender: jest.fn(),
      hentOgVisBruker: jest.fn(),
      hentOgVisVirksomhet: jest.fn(),
      fagsakListe: [],
      hentOgVisRepresentant: jest.fn(),
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
        soknadslandUkjenteEllerAlleEosLand: "soknadslandUkjenteEllerAlleEosLand",
        periodeFraOgMed: "periodeFraOgMed",
        periodeTilOgMed: "periodeTilOgMed",
        hovedpart: "hovedpart",
        formNavn: "opprett_ny_sak",
      },
      formErrors: {},
      settFeltInnhold: jest.fn(),
      settJournalforingHensikt: jest.fn(),
      submitFailed: false,
      avbrytJournalforing: jest.fn(),
      kanSubmittes: true,
      handleSubmit: jest.fn(),
      submitJournalforing: jest.fn(),
    };
  });

  each([UTSENDT_SELVSTENDIG, UTSENDT_ARBEIDSTAKER, ARBEID_NORGE_BOSATT_ANNET_LAND]).it(
    `Opprett Sak. Skal ha fra/til dato og liste over land`,
    (behandlingstema) => {
      props.formValues.behandlingstema = behandlingstema;
      props.formValues.behandlingstype = MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG;
      props.formValues.sakstema = MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG;
      props.formValues.sakstype = MKV.Koder.sakstyper.EU_EOS;
      props.formValues.journalforingGjelder = MKV.Koder.aktoersroller.BRUKER;

      props.formValues.journalforingSoknadsland = behandlingstema;
      const opprettSak = shallow(<OpprettSak {...props} />);

      const datovelger = opprettSak.find(Skjema.Datovelger);
      const radioKnapper = opprettSak.find(Skjema.Radio);
      const multiselect = opprettSak.find(MultiSelect);

      expect(datovelger).toHaveLength(2);
      expect(radioKnapper).toHaveLength(0);
      expect(multiselect).toHaveLength(1);
    }
  );

  each([ARBEID_I_UTLANDET, YRKESAKTIV]).it(`Opprett sak, skal ikke ha tilvalg`, (behandlingstema) => {
    props.formValues.behandlingstema = behandlingstema;
    props.formValues.sakstema = MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG;
    props.formValues.sakstype = MKV.Koder.sakstyper.TRYGDEAVTALE;
    props.formValues.journalforingGjelder = MKV.Koder.aktoersroller.BRUKER;

    const opprettSak = shallow(<OpprettSak {...props} />);
    const datovelger = opprettSak.find(Skjema.Datovelger);
    const radioKnapper = opprettSak.find(Skjema.Radio);
    const multiselect = opprettSak.find(MultiSelect);

    expect(datovelger).toHaveLength(0);
    expect(radioKnapper).toHaveLength(0);
    expect(multiselect).toHaveLength(0);
  });

  it(`Opprett sak. Skal ha fra/til dato, valg av land, radio knapper`, () => {
    props.formValues.behandlingstema = ARBEID_FLERE_LAND;
    props.formValues.behandlingstype = MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG;
    props.formValues.journalforingSoknadsland = ARBEID_FLERE_LAND;
    props.formValues.sakstema = MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG;
    props.formValues.sakstype = MKV.Koder.sakstyper.EU_EOS;
    props.formValues.journalforingGjelder = MKV.Koder.aktoersroller.BRUKER;

    const opprettSak = shallow(<OpprettSak {...props} />);
    const datovelger = opprettSak.find(Skjema.Datovelger);
    const radioKnapper = opprettSak.find(Skjema.Radio);
    const multiselect = opprettSak.find(MultiSelect);

    expect(datovelger).toHaveLength(2);
    expect(radioKnapper).toHaveLength(2);
    expect(multiselect).toHaveLength(1);
  });
});
