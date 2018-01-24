import * as Skjema from '../felles-komponenter/skjema';

/** Definer alle felter med validering. Dette objektet brukes også i validForm decorator.
 */
export const feltGrupper = {
  inntekt: {
    inntektNorskIPerioden: [],
    inntektUtenlandskIPerioden: [],
    inntektNaeringIPerioden: [],
  },
  oppholdUtland: {
    studentIEOS: [],
    studentSkole: [(value, props) => Skjema.Validering.avhengerAvSann('studentIEOS', value, props)],
    studentSemester: [(value, props) => Skjema.Validering.avhengerAvSann('studentIEOS', value, props)],
    studieLand: [(value, props) => Skjema.Validering.avhengerAvSann('studentIEOS', value, props)],
    studentFinansiering: [(value, props) => Skjema.Validering.avhengerAvSann('studentIEOS', value, props)],
  },
  arbeidNorge: {
    valgteArbeidsforhold: [],
    arbeidsforholdOpprettholdIHelePerioden: [],
    brukerErSelvstendigNaeringsdrivende: [],
    selvstendigFortsetterEtterArbeidIUtlandet: [],
    arbeidsforholdVikarNavn: [],
    vikarOrgnr: [],
    flyendePersonellHjemmebase: [],
    ansattPaSokkelEllerSkip: [],
    navnSkipEllerSokkel: [],
    sokkelLand: [],
    skipFartsomrade: [],
    skipFlaggLand: [],
    kontaktNavn: [],
    kontaktEpost: [],
    fullmektigFirma: [],
    fullmektigAdresse: [],
  },
  bekreftelser: {
    arbeidsgiverBekrefterUtsendelse: [Skjema.Validering.erPakrevet],
    arbeidstakerAnsattUnderUtsendelsen: [Skjema.Validering.erPakrevet],
    erstatterArbeidstakerenUtsendte: [Skjema.Validering.erPakrevet],
    arbeidstakerTidligereUtsendt24Mnd: [Skjema.Validering.erPakrevet],
    arbeidsgiverBetalerArbeidsgiveravgift: [Skjema.Validering.erPakrevet],
    trygdeavgiftTrukketGjennomSkatt: [Skjema.Validering.erPakrevet],
    trygdeavgiftTrukketGjennomSkattDato: [Skjema.Validering.erPakrevet, Skjema.Validering.erDato],
  },
  faktaavklaring: {
    faktaavklaringOppholdsLand: [],
    faktaavklaringPeriodeFraOgMed: [],
    faktaavklaringPeriodeTilOgMed: [],
    faktaavklaringSysselsetting: [],
    faktaavklaringAnsattINorskSelskap: [],
    faktaavklaringErstatterTidligereUtsendt: [],
    faktaavklaringUtsendingMindreEnn24Mnd: [],
    faktaavklaringSektor: [],
    faktaavklaringAntallLand: [],
    faktaavklaringAktivitetINorge: [],
    faktaavklaringAntallArbeidsgivere: [],
    faktaavklaringVekslingMellomLand: [],
    faktaavklaringAktivitetLand: [],
  },
};

/** Traverserer feltGrupper og returnerer kun feltnavn i form av en string-array.
 *
 * @param grupper Objekt med felter gruppert.
 */
export const alleFeltNavn = grupper => (Object.keys(grupper).reduce(
  (samling, gruppe) =>
    ([...samling, ...Object.keys(grupper[gruppe])])
  , []
));

/** Traverserer feltGrupper og returnerer kun feltnavn i form av en string-array.
 *
 * @param grupper Objekt med felter gruppert.
 */
export const alleValideringer = grupper => (Object.keys(grupper).reduce(
  (samling, gruppe) =>
    ({ ...samling, ...grupper[gruppe] })
  , {}
));

/** Traverser alle feil som finnes i skjemaet (på grunnlag av validering) og mål opp mot kjente
 * felter i grupper (paneler) slik at det er mulig å avgjøre om et panel i sin helhet validerer korrekt.
 * @param felterMedFeil Object med alle felter som ikke validerer
 */
export const gyldigePaneler = felterMedFeil => {
  // Konverter til array.
  const felterMedFeilArray = felterMedFeil ? Object.keys(felterMedFeil) : [];

  // Gjør en reduksjon på hovedgruppene i feltGrupper.
  return Object.keys(feltGrupper).reduce((collection, gruppe) => {
    // En gruppe kan være 'bekreftelser', 'inntekt', 'person' eller liknende.
    const felterIGruppen = feltGrupper[gruppe];
    // Match felter i den aktuelle gruppen med listen over felter som faktisk inneholder feil. Dersom ingen treff,
    // returneres true, som må reverseres siden Saksbehandling forventer state gyldigPanel: true | false.
    const paneletInneholderFeil = !(Object.keys(felterIGruppen).some(felt => felterMedFeilArray.includes(felt)));
    return { ...collection, [gruppe]: paneletInneholderFeil };
  }, {});
};
