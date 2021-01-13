/* eslint import/prefer-default-export:"off" */
import PT from "prop-types";
import { ArbeidUtland } from "./arbeidUtland";
import { Periode } from "./periode";

const JuridiskArbeidsgiverNorgePropType = PT.shape({
  andelKontrakterINorge: PT.number,
  andelRekruttertINorge: PT.number,
  andelOmsetningINorge: PT.number,
  andelOppdragINorge: PT.number,
  antallAdmAnsatte: PT.number,
  antallAnsatte: PT.number,
  antallUtsendte: PT.number,
  ekstraArbeidsgivere: PT.arrayOf(PT.string),
});
const BostedPropType = PT.shape({
  antallMaanederINorge: PT.number,
  intensjonOmRetur: PT.bool,
});
const ForetakUtlandPropType = PT.arrayOf(
  PT.shape({
    adresse: PT.shape({
      gatenavn: PT.string,
      husnummer: PT.string,
      postnummer: PT.string,
      poststed: PT.string,
      region: PT.string,
    }),
    navn: PT.string,
    orgnr: PT.string,
  })
);
const MaritimtArbeidPropType = PT.arrayOf(
  PT.shape({
    fartsomradeKode: PT.string,
    flaggLandkode: PT.string,
    installasjonsLandkode: PT.string,
    navn: PT.string,
    territorialfarvann: PT.string,
  })
);
const OppholdUtlandPropType = PT.shape({
  ektefelleEllerBarnINorge: PT.bool,
  oppholdsPeriode: Periode,
  oppholdslandkoder: PT.arrayOf(PT.string),
  studentFinansieringKode: PT.string,
  studentSemester: PT.string,
});
const PersonOpplysningerPropType = PT.shape({
  medfolgendeFamilie: PT.arrayOf(PT.string),
  utenlandskIdent: PT.arrayOf(
    PT.shape({
      ident: PT.string,
      landkode: PT.string,
    })
  ),
});
const SelvstendigArbeidPropType = PT.shape({
  erSelvstendig: PT.bool,
  selvstendigForetak: PT.arrayOf(
    PT.shape({
      fortsetterEtterArbeidIUtlandet: PT.bool,
      orgnr: PT.string,
    })
  ),
});
const SoeknadslandPropType = PT.shape({
  landkoder: PT.arrayOf(PT.string),
});

const BehandlingsgrunnnlagDataPropType = PT.shape({
  juridiskArbeidsgiverNorge: JuridiskArbeidsgiverNorgePropType,
  arbeidUtland: ArbeidUtland,
  bosted: BostedPropType,
  foretakUtland: ForetakUtlandPropType,
  maritimtArbeid: MaritimtArbeidPropType,
  oppholdUtland: OppholdUtlandPropType,
  periode: Periode,
  personOpplysninger: PersonOpplysningerPropType,
  selvstendigArbeid: SelvstendigArbeidPropType,
  soeknadsland: SoeknadslandPropType,
});

const BehandlingsgrunnlagPropType = PT.shape({
  data: BehandlingsgrunnnlagDataPropType,
  type: PT.string,
});

export { BehandlingsgrunnlagPropType as Behandlingsgrunnlag };
