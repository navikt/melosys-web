import * as Validering from "../felleskomponenter/skjema/validering";

/** Definer alle felter med validering. Dette objektet brukes også i validForm decorator.
 */
export const feltGrupper = {
  personOpplysninger: {},
  inntekt: {
    inntektNorskIPerioden: [],
    inntektUtenlandskIPerioden: [],
  },
  oppholdUtland: {
    studentSemester: [(value, props) => Validering.avhengerAvSann("studentIEOS", value, props)],
    studieLand: [(value, props) => Validering.avhengerAvSann("studentIEOS", value, props)],
    studentFinansiering: [(value, props) => Validering.avhengerAvSann("studentIEOS", value, props)],
  },
  bosted: {
    intensjonOmRetur: [],
    familiesBosted: [],
  },
  bekreftelser: {
    arbeidsgiverBekrefterUtsendelse: [(value) => Validering.erPakrevet(value)],
    arbeidstakerAnsattUnderUtsendelsen: [(value) => Validering.erPakrevet(value)],
    erstatterArbeidstakerenUtsendte: [(value) => Validering.erPakrevet(value)],
    arbeidstakerTidligereUtsendt24Mnd: [(value) => Validering.erPakrevet(value)],
    arbeidsgiverBetalerArbeidsgiveravgift: [(value) => Validering.erPakrevet(value)],
    trygdeavgiftTrukketGjennomSkatt: [(value) => Validering.erPakrevet(value)],
    trygdeavgiftTrukketGjennomSkattDato: [(value) => Validering.erPakrevet(value), (value) => Validering.erDato(value)],
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
    avklartefaktaSoknadsland: [],
    avklartefaktaPeriodeFraOgMed: [(value) => Validering.erPakrevet(value)],
    avklartefaktaPeriodeTilOgMed: [(value) => Validering.erPakrevet(value)],
    avklartefaktaYrkesgruppe: [],
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
    avklartefaktaForretningsstedLand: [],
    avklartefaktaForretningsstedAntallArbeidsgivere: [],
    avklartefaktaForretningsstedFordelingArbeidsgivere: [],
  },
};
