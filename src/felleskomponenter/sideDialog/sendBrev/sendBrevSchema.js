import { array, object, string } from "yup";
import * as StringUtils from "../../../utils/streng";
import { erAnnenOrganisasjon, erArbeidsgiver, erVirksomhet } from "./brevMottaker/brevMottaker";

const BREVMAL_MANGLER = { melding: "Du må velge brevmal" };
const VALGT_MAL_MANGLER = { melding: "Finner ikke mal tilhørende type brev" };
const MOTTAKER_MANGLER = { melding: "Velg mottaker" };
const ARBEIDSGIVER_MANGLER = { melding: "Velg arbeidsgiver" };
const FELT_MANGLER = { melding: "Du må fylle ut alle påkrevde felter" };
const ORGNUMMER_FELT_MANGLER = { melding: "Fyll ut organisasjonsnummer" };
const ORGNUMMER_UGYLDIG = { melding: "Ugyldig organisasjonsnummer" };
const TITTEL_MANGLER = { melding: "Du må velge overskrift" };
const FRITEKST_MANGLER = { melding: "Du må skrive inn tekst til brevet" };
const DISTRIBUSJONSTYPE_MANGLER = { melding: "Du må velge type brev" };
const INNLEDNING_FRITEKST_MANGLER = { melding: "Du må skrive innledningstekst" };
const MANGLER_FRITEKST_MANGLER = { melding: "Du må skrive inn fritekst" };
const NORSKE_MYNDIGHETER_MANGLER = { melding: "Du må velge minst én etat" };

const manglerFeltVerdi = (felt) => {
  if (felt && !felt.valg) {
    return !StringUtils.harStrengInnhold(felt.feltVerdi);
  }
  return !felt;
};

const manglerNoenFeltValgt = (felt, valgtBrev) => {
  if (!valgtBrev || !valgtBrev.felter || !felt) return false;
  const spesialFeltKoder = ["FRITEKST", "INNLEDNING_FRITEKST", "MANGLER_FRITEKST", "DISTRIBUSJONSTYPE"];
  for (let i = 0; i < valgtBrev.felter.length; i += 1) {
    const currentFelt = valgtBrev.felter[i];
    if (currentFelt) {
      const erSpesialFeltKoder = spesialFeltKoder.includes(currentFelt.kode);
      if (!erSpesialFeltKoder && currentFelt.paakrevd && manglerFeltVerdi(felt[currentFelt.kode])) {
        return true;
      }
    }
  }

  return false;
};

const manglerFeltMedValg = (feltNavn) => (felt, valgtBrev) => {
  if (!felt || !valgtBrev) return false;

  const feltFravalgtBrev = valgtBrev.felter?.find((valgtBrevFelt) => valgtBrevFelt.kode === feltNavn);
  if (!feltFravalgtBrev) return false;

  const valgtAlternativ = feltFravalgtBrev.valg?.valgAlternativer?.find(
    (alternativ) => alternativ.kode === felt[feltNavn]?.valg,
  );

  return valgtAlternativ && !valgtAlternativ.visFelt ? false : !felt[feltNavn]?.feltVerdi;
};

const paakrevdFeltTest = (kode, errorMessage) =>
  string()
    .nullable()
    .test(`${kode.toLowerCase()}-check`, errorMessage, function paakrevdFeltTestFn(value, context) {
      if (!context?.parent?.valgtBrev) return true;

      const feltMeta = context.parent.valgtBrev.felter?.find((f) => f.kode === kode);
      if (!feltMeta?.paakrevd) return true;

      return value || !!context.parent.felt?.[kode]?.feltVerdi;
    });

const send_brev = object().shape({
  mottaker: string().required(MOTTAKER_MANGLER),
  type: string().required(BREVMAL_MANGLER),
  valgtMottaker: object().required(MOTTAKER_MANGLER),
  valgtBrev: object().required(VALGT_MAL_MANGLER),

  distribusjonstype: string()
    .nullable()
    .test("distribusjonstype-check", DISTRIBUSJONSTYPE_MANGLER, function distribusjonstypeCheck(value, context) {
      if (!context?.parent?.valgtBrev) return true;
      const distribusjonsfelt = context.parent.valgtBrev.felter?.find((f) => f.kode === "DISTRIBUSJONSTYPE");
      if (!distribusjonsfelt?.paakrevd) return true;
      return !!context.parent.felt?.DISTRIBUSJONSTYPE?.valg;
    }),

  felt: object().optional(),

  organisasjonsnummer: string()
    .when("valgtMottaker", {
      is: (valgtMottaker) => erAnnenOrganisasjon(valgtMottaker?.rolle),
      then: string().erOrgnr(ORGNUMMER_UGYLDIG).required(ORGNUMMER_FELT_MANGLER).nullable(),
    })
    .nullable()
    .notRequired(),

  norskeMyndigheter: array()
    .of(string().erOrgnr(ORGNUMMER_UGYLDIG))
    .when("valgtMottaker", {
      is: (valgtMottaker) => valgtMottaker?.rolle === "NORSK_MYNDIGHET",
      then: array().min(1, NORSKE_MYNDIGHETER_MANGLER),
    }),

  kontaktperson: string().nullable().notRequired(),

  arbeidsgiver: string()
    .when("valgtMottaker", {
      is: (valgtMottaker) => erVirksomhet(valgtMottaker?.rolle) || erArbeidsgiver(valgtMottaker?.rolle),
      then: string().required(ARBEIDSGIVER_MANGLER).nullable(),
    })
    .nullable()
    .notRequired(),

  fritekst: paakrevdFeltTest("FRITEKST", FRITEKST_MANGLER),
  innledningFritekst: paakrevdFeltTest("INNLEDNING_FRITEKST", INNLEDNING_FRITEKST_MANGLER),
  manglerFritekst: paakrevdFeltTest("MANGLER_FRITEKST", MANGLER_FRITEKST_MANGLER),

  fritekstTittel: string()
    .nullable()
    .when(["felt", "valgtBrev"], {
      is: manglerFeltMedValg("BREV_TITTEL"),
      then: string().required(TITTEL_MANGLER),
    }),

  dokumentTittel: string().nullable().notRequired(),

  erFeltGyldig: string()
    .nullable()
    .when(["felt", "valgtBrev"], {
      is: manglerNoenFeltValgt,
      then: string().required(FELT_MANGLER),
    }),
});

export default send_brev;
