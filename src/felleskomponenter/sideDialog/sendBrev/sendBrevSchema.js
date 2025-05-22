import { array, object, string } from "yup";
import * as StringUtils from "../../../utils/streng";
import { erAnnenOrganisasjon, erArbeidsgiver, erVirksomhet } from "./brevMottaker/brevMottaker";

const TYPE_MANGLER = { melding: "Velg type brev" };
const VALGT_MAL_MANGLER = { melding: "Finner ikke mal tilhørende type brev" };
const MOTTAKER_MANGLER = { melding: "Velg mottaker" };
const ARBEIDSGIVER_MANGLER = { melding: "Velg arbeidsgiver" };
const FELT_MANGLER = { melding: "Fyll ut alle felter" };
const ORGNUMMER_FELT_MANGLER = { melding: "Fyll ut organisasjonsnummer" };
const ORGNUMMER_UGYLDIG = { melding: "Ugyldig organisasjonsnummer" };
const TITTEL_MANGLER = { melding: "Fyll inn tittel" };

const manglerFeltVerdi = (felt) => {
  if (felt && !felt.valg) {
    return !StringUtils.harStrengInnhold(felt.feltVerdi);
  }
  return !felt;
};

const manglerNoenFeltValgt = (felt, valgtBrev) => {
  if (!valgtBrev) return true;
  if (!valgtBrev?.felter) return false;
  if (!felt) return true;
  for (let i = 0; i < valgtBrev.felter.length; i += 1) {
    if (valgtBrev.felter[i]?.paakrevd && manglerFeltVerdi(felt[valgtBrev.felter[i]?.kode])) return true;
  }
  return false;
};

const manglerFeltMedValg = (feltNavn) => (felt, valgtBrev) => {
  const feltFravalgtBrev = valgtBrev?.felter?.find((valgtBrevFelt) => valgtBrevFelt.kode === feltNavn);
  if (!feltFravalgtBrev) {
    return false;
  }

  const valgtAlternativ = feltFravalgtBrev?.valg?.valgAlternativer.find(
    (alternativ) => alternativ.kode === felt?.[feltNavn]?.valg,
  );
  return valgtAlternativ && !valgtAlternativ.visFelt ? false : !felt?.[feltNavn]?.feltVerdi;
};

const send_brev = object().shape({
  mottaker: string().required(MOTTAKER_MANGLER),
  type: string().required(TYPE_MANGLER),
  valgtMottaker: object().required(MOTTAKER_MANGLER),
  valgtBrev: object().required(VALGT_MAL_MANGLER),
  organisasjonsnummer: string()
    .when("valgtMottaker", {
      is: (valgtMottaker) => erAnnenOrganisasjon(valgtMottaker?.rolle),
      then: (schema) => schema.erOrgnr(ORGNUMMER_UGYLDIG).required(ORGNUMMER_FELT_MANGLER).nullable(),
    })
    .nullable(),
  norskeMyndigheter: array().of(string().erOrgnr(ORGNUMMER_UGYLDIG)),
  kontaktperson: string().nullable(),
  arbeidsgiver: string()
    .when("valgtMottaker", {
      is: (valgtMottaker) => erVirksomhet(valgtMottaker?.rolle) || erArbeidsgiver(valgtMottaker?.rolle),
      then: (schema) => schema.required(ARBEIDSGIVER_MANGLER).nullable(),
    })
    .nullable(),
  felt: object(),
  fritekstTittel: string().when(["felt", "valgtBrev"], {
    is: (felt, valgtBrev) => manglerFeltMedValg("BREV_TITTEL")(felt, valgtBrev),
    then: (schema) => schema.required(TITTEL_MANGLER),
  }),
  erFeltGyldig: string().when(["felt", "valgtBrev"], {
    is: (felt, valgtBrev) => manglerNoenFeltValgt(felt, valgtBrev),
    then: (schema) => schema.required(FELT_MANGLER),
  }),
});

export default send_brev;
