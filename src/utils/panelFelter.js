import * as Skjema from '../felles-komponenter/skjema';

/** Definer alle felter med validering. Dette objektet brukes også i validForm decorator.
 */
export const feltGrupper = {
  personOpplysninger: {
    medfolgendeAndre: [value => (value !== undefined && (Skjema.Validering.erGyldigFnr(value) || Skjema.Validering.erGyldigDnr(value)) ? null : 'Ugyldig fnr eller dnr')],
  },
  inntekt: {
    inntektNorskIPerioden: [],
    inntektUtenlandskIPerioden: [],
    inntektNaeringIPerioden: [],
  },
  oppholdUtland: {
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
    kontaktNavn: [],
    kontaktEpost: [],
    fullmektigFirma: [],
    fullmektigAdresse: [],
  },
  bosted: {
    intensjonOmRetur: [],
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
  selvstendigArbeid: {
    erSelvstendig: [],
    selvstendigForetak: [],
  },
  maritimtArbeid: {
    maritimType: [],
    skipsNavn: [],
    fartsomrade: [],
    flaggLand: [],
    installasjonsLand: [],
  },
  avklartefakta: {
    avklartefaktaOppholdsLand: [],
    avklartefaktaPeriodeFraOgMed: [value => Skjema.Validering.erPakrevet(value)],
    avklartefaktaPeriodeTilOgMed: [value => Skjema.Validering.erPakrevet(value)],
    avklartefaktaSysselsetting: [],
    avklartefaktaAnsattINorskSelskap: [],
    avklartefaktaErstatterTidligereUtsendt: [],
    avklartefaktaUtsendingMindreEnn24Mnd: [],
    avklartefaktaSektor: [],
    avklartefaktaAntallLand: [],
    avklartefaktaAktivitetINorge: [],
    avklartefaktaMarginaltArbeid: [],
    avklartefaktaVekslingMellomLand: [],
    avklartefaktaAktivitetLand: [],
    avklartefaktaBekrefterFamiliebosted: [],
    avklartefaktaBekrefterDisponering: [],
    avklartefaktaBostedsland: [],
    avklartefaktaValgteArbeidsgivere: [],
    avklartefaktaForretningsstedLand: [],
    avklartefaktaForretningsstedAntallArbeidsgivere: [],
    avklartefaktaForretningsstedFordelingArbeidsgivere: [],
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
