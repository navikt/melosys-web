import { array, object, string } from "yup";
import * as StringUtils from "../../../utils/streng";
import { erAnnenOrganisasjon, erArbeidsgiver, erVirksomhet } from "./brevMottaker/brevMottaker";

const TYPE_MANGLER = { melding: "Velg brevmal" };
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

const finnManglendeFelt = (felt, valgtBrev) => {
  if (!valgtBrev) return [];
  if (!valgtBrev?.felter) return [];
  if (!felt) return valgtBrev.felter.filter((f) => f.paakrevd).map((f) => f.kode);

  const manglendeFelt = [];
  for (let i = 0; i < valgtBrev.felter.length; i += 1) {
    const brevFelt = valgtBrev.felter[i];
    if (brevFelt?.paakrevd && manglerFeltVerdi(felt[brevFelt.kode])) {
      manglendeFelt.push(brevFelt.kode);
    }
  }
  return manglendeFelt;
};

const lagDetaljertFeltFeilmelding = (felt, valgtBrev) => {
  const manglendeFelt = finnManglendeFelt(felt, valgtBrev);
  if (manglendeFelt.length === 0) return null;

  const feltNavn = manglendeFelt.map((feltKode) => {
    const brevFelt = valgtBrev?.felter?.find((f) => f.kode === feltKode);

    // Bruk mer brukervennlige navn for spesifikke felt
    const brukervennligeNavn = {
      INNLEDNING_FRITEKST: "Innledning",
      MANGLER_FRITEKST: "Mangler informasjon",
      FRITEKST: "Fritekst",
      BREV_TITTEL: "Brevtittel",
    };

    return brukervennligeNavn[feltKode] || brevFelt?.beskrivelse || brevFelt?.navn || feltKode;
  });

  if (feltNavn.length === 1) {
    return { melding: `Fyll ut feltet: ${feltNavn[0]}` };
  } else if (feltNavn.length === 2) {
    return { melding: `Fyll ut feltene: ${feltNavn.join(" og ")}` };
  } else {
    const sisteFelt = feltNavn.pop();
    return { melding: `Fyll ut feltene: ${feltNavn.join(", ")} og ${sisteFelt}` };
  }
};

// ... existing code ...

const send_brev = object().shape({
  mottaker: string().nullable(),
  type: string().required(TYPE_MANGLER),
  valgtMottaker: object().required(MOTTAKER_MANGLER),
  organisasjonsnummer: string().when("valgtMottaker", {
    is: (valgtMottaker) => erAnnenOrganisasjon(valgtMottaker?.rolle),
    then: (schema) => schema.erOrgnr(ORGNUMMER_UGYLDIG).required(ORGNUMMER_FELT_MANGLER),
    otherwise: (schema) => schema.nullable(),
  }),
  norskeMyndigheter: array().of(string().erOrgnr(ORGNUMMER_UGYLDIG)),
  kontaktperson: string().nullable(),
  arbeidsgiver: string()
    .when("valgtMottaker", {
      is: (valgtMottaker) => erVirksomhet(valgtMottaker?.rolle) || erArbeidsgiver(valgtMottaker?.rolle),
      then: (schema) => schema.required(ARBEIDSGIVER_MANGLER),
      otherwise: (schema) => schema.nullable(),
    })
    .nullable(),
  felt: object().test({
    name: "felt-validering",
    test: function (value, context) {
      const { valgtBrev } = context.parent;
      if (!valgtBrev?.felter) return true;

      let harFeil = false;
      const errors = {};

      // Sjekk hvert obligatorisk felt
      valgtBrev.felter.forEach((brevFelt) => {
        if (brevFelt.paakrevd && manglerFeltVerdi(value?.[brevFelt.kode])) {
          const feilmelding = { melding: `${brevFelt.beskrivelse || brevFelt.navn || brevFelt.kode} må fylles ut` };

          // Sett feil på felt-objektet
          if (!errors[brevFelt.kode]) {
            errors[brevFelt.kode] = {};
          }
          errors[brevFelt.kode].feltVerdi = feilmelding;
          harFeil = true;
        }
      });

      if (harFeil) {
        // Returner feil med korrekt struktur for Redux Form
        return this.createError({
          path: this.path,
          message: errors,
        });
      }

      return true;
    },
  }),
  fritekstTittel: string().when(["felt", "valgtBrev"], {
    is: (felt, valgtBrev) => manglerFeltMedValg("BREV_TITTEL")(felt, valgtBrev),
    then: (schema) => schema.required(TITTEL_MANGLER),
    otherwise: (schema) => schema.nullable(),
  }),
  // Behold erFeltGyldig, men gjør den kun relevant når felt faktisk kan fylles ut
  erFeltGyldig: string().when(["felt", "valgtBrev", "valgtMottaker", "type"], {
    is: (felt, valgtBrev, valgtMottaker, type) => {
      // Kun valider felt hvis både mottaker og brevtype er valgt (dvs. feltene er synlige)
      if (!valgtMottaker || !type || !valgtBrev?.felter) return false;
      return manglerNoenFeltValgt(felt, valgtBrev);
    },
    then: (schema) =>
      schema.test({
        name: "detaljert-felt-validering",
        test: (value, context) => {
          const { felt, valgtBrev } = context.parent;
          const feilmelding = lagDetaljertFeltFeilmelding(felt, valgtBrev);
          return context.createError({
            message: feilmelding?.melding || FELT_MANGLER.melding,
          });
        },
      }),
    otherwise: (schema) => schema.nullable(),
  }),
});

export default send_brev;
