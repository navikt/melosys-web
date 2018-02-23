import periode from '../periode-body';
import land from '../land-body';

const { Matchers } = require('@pact-foundation/pact');

const {
  boolean, decimal, eachLike, integer, iso8601Date, like,
} = Matchers;

const soknadDokument = {
  opplysningerOmBrukeren: {
    personUtenlandskID: '123-12-123456789',
  },
  arbeidUtland: {
    arbeidsland: eachLike(land, { min: 1 }),
    arbeidsperiode: periode,
    arbeidsandelNorge: decimal(33.3),
    arbeidsandelUtland: decimal(66.6),
    arbeidsstedUtland: null,
    bostedsland: 'SE',
    erstatterTidligereUtsendt: boolean(false),
  },
  foretakUtland: {
    foretakUtlandNavn: like('Volkswagen AG'),
    foretakUtlandOrgnr: '1122334444',
    foretakUtlandAdresse: null,
  },
  oppholdUtland: {
    oppholdsland: [
      'DE',
    ],
    oppholdsPeriode: periode,
    studentSkole: 'University of The Arts',
    studentIEOS: true,
    studentFinansiering: 'Har egne midler oppspart, stotte fra familie.',
    studentSemester: '2018/2019',
    studieLand: 'UK',
  },
  arbeidNorge: {
    valgteArbeidsforhold: [
      44137901,
    ],
    arbeidsforholdOpprettholdIHelePerioden: true,
    brukerErSelvstendigNaeringsdrivende: true,
    selvstendigFortsetterEtterArbeidIUtlandet: true,
    arbeidsforholdVikarNavn: 'Vikarbyraaet AS',
    vikarOrgnr: '22334455',
    flyendePersonellHjemmebase: 'Flybasen Int. Airport, ....',
    ansattPaSokkelEllerSkip: 'sokkel | skip',
    navnSkipEllerSokkel: 'Trym-sokkelen',
    sokkelLand: 'SE',
    skipFartsomrade: 'Europeisk fart',
    skipFlaggLand: 'SE',
    kontaktNavn: 'Ola Nordmann',
    kontaktEpost: 'ola.nordmann@fullmektigfirma.no',
    fullmektigFirma: 'Advokatfullmektig AS',
    fullmektigAdresse: 'Adresseveien 123, 1234 Byen',
  },
  juridiskArbeidsgiverNorge: {
    antallAnsatte: integer(350),
    antallAdminAnsatte: integer(250),
    antallAdminAnsatteEOS: integer(75),
    andelOmsetningINorge: 78.5,
    andelKontrakterINorge: 50.5,
    erBemanningsbyra: false,
    hattDriftSiste12Mnd: true,
    antallUtsendte: 30,
  },
  arbeidsinntekt: {
    inntektNorskIPerioden: integer(5500),
    inntektUtenlandskIPerioden: integer(2000),
    inntektNaeringIPerioden: 0,
    inntektNaturalYtelser: eachLike('Fri bolig'),
    inntektErInnrapporteringspliktig: true,
    inntektTrygdeavgiftBlirTrukket: true,
  },
  arbeidsgiversBekreftelse: {
    arbeidsgiverBekrefterUtsendelse: true,
    arbeidstakerAnsattUnderUtsendelsen: true,
    erstatterArbeidstakerenUtsendte: false,
    arbeidstakerTidligereUtsendt24Mnd: false,
    arbeidsgiverBetalerArbeidsgiveravgift: true,
    trygdeavgiftTrukketGjennomSkatt: true,
    trygdeavgiftTrukketGjennomSkattDato: iso8601Date('2018-01-01'),
  },
  tilleggsopplysninger: {
    fritekstFraSoeker: 'Lang utgreiing om utsendelsen som egentlig ikke er relevant for saksbehandlingen...',
  },
};

const soknad = {
  behandlingID: 4,
  soknadDokument,
};

export default soknad;
