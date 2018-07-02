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
    studentIEOS: '',
    studentSemester: [(value, props) => Skjema.Validering.avhengerAvSann('studentIEOS', value, props)],
    studieLand: [(value, props) => Skjema.Validering.avhengerAvSann('studentIEOS', value, props)],
    studentFinansiering: [(value, props) => Skjema.Validering.avhengerAvSann('studentIEOS', value, props)],
  },
  arbeidNorge: {
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
  bosted: {
    intensjonOmRetur: [],
    bostedUtenforNorge: [],
    familiesBosted: [],
  },
  bekreftelser: {
    arbeidsgiverBekrefterUtsendelse: [value => Skjema.Validering.erPakrevet(value)],
    arbeidstakerAnsattUnderUtsendelsen: [value => Skjema.Validering.erPakrevet(value)],
    erstatterArbeidstakerenUtsendte: [value => Skjema.Validering.erPakrevet(value)],
    arbeidstakerTidligereUtsendt24Mnd: [value => Skjema.Validering.erPakrevet(value)],
    arbeidsgiverBetalerArbeidsgiveravgift: [value => Skjema.Validering.erPakrevet(value)],
    trygdeavgiftTrukketGjennomSkatt: [value => Skjema.Validering.erPakrevet(value)],
    trygdeavgiftTrukketGjennomSkattDato: [value => Skjema.Validering.erPakrevet(value), value => Skjema.Validering.erDato(value)],
  },
  faktaavklaring: {
    faktaavklaringOppholdsLand: [],
    faktaavklaringPeriodeFraOgMed: [value => Skjema.Validering.erPakrevet(value)],
    faktaavklaringPeriodeTilOgMed: [value => Skjema.Validering.erPakrevet(value)],
    faktaavklaringSysselsetting: [],
    faktaavklaringAnsattINorskSelskap: [],
    faktaavklaringErstatterTidligereUtsendt: [],
    faktaavklaringUtsendingMindreEnn24Mnd: [],
    faktaavklaringSektor: [],
    faktaavklaringAntallLand: [],
    faktaavklaringAktivitetINorge: [],
    faktaavklaringMarginaltArbeid: [],
    faktaavklaringVekslingMellomLand: [],
    faktaavklaringAktivitetLand: [],
    faktaavklaringBekrefterFamiliebosted: [],
    faktaavklaringBekrefterDisponering: [],
    faktaavklaringBostedsland: [],
    faktaavklaringValgteArbeidsgivere: [],
    faktaavklaringForretningsstedLand: [],
    faktaavklaringForretningsstedAntallArbeidsgivere: [],
    faktaavklaringForretningsstedFordelingArbeidsgivere: [],
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
