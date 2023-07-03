import MKV from "../../../melosyskodeverk";

import { JournalforingForm } from "./journalforingform";
import SendForvaltningsMelding from "./sendForvaltningsMelding";
import Komponent, { KomponentUtenOverskrift } from "./komponent";
import Checkbox from "../../../felleskomponenter/skjema/input/checkbox";

const { BRUKER, VIRKSOMHET } = MKV.Koder.aktoersroller;

const { MEDLEMSKAP_LOVVALG, UNNTAK, TRYGDEAVGIFT } = MKV.Koder.sakstemaer;

const { FØRSTEGANG, SOEKNAD, SED, NY_VURDERING, HENVENDELSE, KLAGE, ANKE, ENDRET_PERIODE } =
  MKV.Koder.behandlinger.behandlingstyper;

describe("JournalforingForm", () => {
  let props = null;

  beforeEach(() => {
    props = {
      journalpostID: "1234",
      hoveddokumentID: "12345",
      vedlegg: [],
      hentOgVisAvsender: jest.fn(),
      hentOgVisBruker: jest.fn(),
      hentOgVisVirksomhet: jest.fn(),
      fagsakListe: [
        {
          saksnummer: "1",
          saksstatus: {
            kode: MKV.Koder.saksstatuser.OPPRETTET,
          },
        },
        {
          saksnummer: "2",
          saksstatus: {
            kode: MKV.Koder.saksstatuser.HENLAGT,
          },
        },
        {
          saksnummer: "3",
          saksstatus: {
            kode: MKV.Koder.saksstatuser.HENLAGT_BORTFALT,
          },
        },
      ],
      hentOgVisRepresentant: jest.fn(),
      behandlingstemaer: [],
      formValues: {
        saksnummer: "-1",
        avsenderType: "",
        journalforingGjelder: BRUKER,
      },
      formErrors: {},
      settFeltInnhold: jest.fn(),
      settJournalforingHensikt: jest.fn(),
      submitFailed: false,
      avbrytJournalforing: jest.fn(),
      kanSubmittes: true,
      handleSubmit: jest.fn(),
      submitJournalforing: jest.fn(),
      submitSpinner: false,
      landkoder: [],
    };
  });

  test("sending av forvaltningsmelding vises for sakstema MEDLEMSKAP_LOVVALG og behandlingstype FØRSTEGANG", () => {
    props.formValues.sakstema = MEDLEMSKAP_LOVVALG;
    props.formValues.opprettnysak_behandlingstype = FØRSTEGANG;

    const journalforingform = shallow(<JournalforingForm {...props} />);
    const komponenter = journalforingform.find(Komponent);

    expect(komponenter.findWhere((n) => n.props().innhold.type === SendForvaltningsMelding)).toHaveLength(1);
  });

  each([UNNTAK, TRYGDEAVGIFT]).it(
    "sending av forvaltningsmelding vises IKKE for behandlingstema FØRSTEGANG og sakstema %s",
    (sakstema) => {
      props.formValues.sakstema = sakstema;
      props.formValues.opprettnysak_behandlingstema = FØRSTEGANG;

      const journalforingform = shallow(<JournalforingForm {...props} />);
      const komponenter = journalforingform.find(Komponent);

      expect(komponenter.findWhere((n) => n.props().innhold.type === SendForvaltningsMelding)).toHaveLength(0);
    }
  );

  each([SOEKNAD, SED, NY_VURDERING, HENVENDELSE, KLAGE, ANKE, ENDRET_PERIODE]).it(
    "sending av forvaltningsmelding vises IKKE for sakstema MEDLEMSKAP_LOVVALG og behandlingstema %s",
    (behandlingstema) => {
      props.formValues.sakstema = MEDLEMSKAP_LOVVALG;
      props.formValues.opprettnysak_behandlingstema = behandlingstema;

      const journalforingform = shallow(<JournalforingForm {...props} />);
      const komponenter = journalforingform.find(Komponent);

      expect(komponenter.findWhere((n) => n.props().innhold.type === SendForvaltningsMelding)).toHaveLength(0);
    }
  );

  test("sending av forvaltningsmelding vises ikke når man journalfører på virksomhet", () => {
    props.formValues.journalforingGjelder = VIRKSOMHET;

    const journalforingform = shallow(<JournalforingForm {...props} />);
    const komponenter = journalforingform.find(Komponent);

    expect(komponenter.findWhere((n) => n.props().innhold.type === SendForvaltningsMelding)).toHaveLength(0);
  });

  test("skalTilordnes vises når vi oppretter sak", () => {
    props.formValues.saksnummer = "-1";

    const journalforingform = shallow(<JournalforingForm {...props} />);
    const komponentUtenOverskrift = journalforingform.find(KomponentUtenOverskrift);

    expect(komponentUtenOverskrift.props().innhold.props.children.some((n) => n.type === Checkbox)).toBeTruthy();
  });

  test("skalTilordnes vises før vi velger sak", () => {
    props.formValues.saksnummer = "";

    const journalforingform = shallow(<JournalforingForm {...props} />);
    const komponentUtenOverskrift = journalforingform.find(KomponentUtenOverskrift);

    expect(komponentUtenOverskrift.props().innhold.props.children.some((n) => n.type === Checkbox)).toBeTruthy();
  });

  test("skalTilordnes vises når sak ikke har saksstatus HENLAGT eller HENLAGT_BORFALT", () => {
    props.formValues.saksnummer = "1";

    const journalforingform = shallow(<JournalforingForm {...props} />);
    const komponentUtenOverskrift = journalforingform.find(KomponentUtenOverskrift);

    expect(komponentUtenOverskrift.props().innhold.props.children.some((n) => n.type === Checkbox)).toBeTruthy();
  });

  test("skalTilordnes vises ikke når sak har saksstatus HENLAGT", () => {
    props.formValues.saksnummer = "2";

    const journalforingform = shallow(<JournalforingForm {...props} />);
    const komponentUtenOverskrift = journalforingform.find(KomponentUtenOverskrift);

    expect(komponentUtenOverskrift.props().innhold.props.children.some((n) => n.type === Checkbox)).toBeFalsy();
  });

  test("skalTilordnes vises ikke når sak har saksstatus HENLAGT_BORFALT", () => {
    props.formValues.saksnummer = "3";

    const journalforingform = shallow(<JournalforingForm {...props} />);
    const komponentUtenOverskrift = journalforingform.find(KomponentUtenOverskrift);

    expect(komponentUtenOverskrift.props().innhold.props.children.some((n) => n.type === Checkbox)).toBeFalsy();
  });
});
