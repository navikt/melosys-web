import { object, string } from "yup";

const TYPE_MANGLER = { melding: "Velg type brev" };
const VALGT_MAL_MANGLER = { melding: "Finner ikke mal tilhørende type brev" };
const MOTTAKER_MANGLER = { melding: "Velg mottaker" };
const ARBEIDSGIVER_MANGLER = { melding: "Velg arbeidsgiver" };
const FELT_MANGLER = { melding: "Fyll ut alle felter" };
const ORGNUMMER_FELT_MANGLER = { melding: "Fyll ut organisasjonsnummer" };
const ORGNUMMER_UGYLDIG = { melding: "Ugyldig organisasjonsnummer" };

const manglerNoenFeltValgt = (felt, valgtMal) => {
  if (!valgtMal) return true;
  if (!valgtMal?.felter) return false;
  if (!felt) return true;
  for (let i = 0; i < valgtMal.felter.length; i += 1) {
    if (valgtMal.felter[i]?.paakrevd && !felt[valgtMal.felter[i]?.kode]) return true;
  }
  return false;
};

const send_brev = object().shape({
  type: string().required(TYPE_MANGLER),
  valgtMal: object().required(VALGT_MAL_MANGLER),
  mottaker: string().required(MOTTAKER_MANGLER),
  organisasjonsnummer: string().when("mottaker", {
    is: (mottaker) => mottaker && JSON.parse(mottaker).rolle === "ARBEIDSGIVER" && JSON.parse(mottaker).frittValg,
    then: string().erOrgnr(ORGNUMMER_UGYLDIG).required(ORGNUMMER_FELT_MANGLER),
  }),
  kontaktperson: string().nullable(),
  arbeidsgiver: string().when("mottaker", {
    is: (mottaker) => mottaker && JSON.parse(mottaker).rolle === "ARBEIDSGIVER" && !JSON.parse(mottaker).frittValg,
    then: string().required(ARBEIDSGIVER_MANGLER),
  }),
  felt: object(),
  erFeltGyldig: string().when(["felt", "valgtMal"], {
    is: manglerNoenFeltValgt,
    then: string().required(FELT_MANGLER),
  }),
});

export default send_brev;
