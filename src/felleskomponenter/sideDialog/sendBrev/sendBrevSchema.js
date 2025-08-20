import { array, object, string } from "yup";
import * as StringUtils from "../../../utils/streng";
import { erAnnenOrganisasjon, erArbeidsgiver, erVirksomhet } from "./brevMottaker/brevMottaker";

const BREVMAL_MANGLER = { melding: "Velg brevmal" };
const MOTTAKER_MANGLER = { melding: "Velg mottaker" };
const ARBEIDSGIVER_MANGLER = { melding: "Velg arbeidsgiver" };
const ORGNUMMER_FELT_MANGLER = { melding: "Fyll ut organisasjonsnummer" };
const ORGNUMMER_UGYLDIG = { melding: "Ugyldig organisasjonsnummer" };

// Spesifikke meldinger per feltkode (samme format som øvrige: { melding: string })
const FELT_FEILMELDINGER = {
  BREV_TITTEL: { melding: "Du må velge overskrift til brevet" },
  INNLEDNING_FRITEKST: { melding: "Du må velge innledningstekst" },
  MANGLER_FRITEKST: { melding: "Fritekst må fylles ut" },
  DISTRIBUSJONSTYPE: { melding: "Du må velge type brev" },
};

// Generisk feilmeding, brukes dersom sspesifikk melding ikke finnes
const FELT_VERDI_MAA_FYLLES_UT = (feltNavn) => `${feltNavn} må fylles ut`;

// Felles helper: returnerer alltid streng (trygg å rendre i UI)
export const hentFeltFeilmelding = (feltKode, visningsnavn) =>
  FELT_FEILMELDINGER[feltKode]?.melding || FELT_VERDI_MAA_FYLLES_UT(visningsnavn);

// Lokal helper for schema: pakk streng til { melding: string } slik at syncErrorsTilFeilmelding forstår bladene
const toMelding = (t) => ({ melding: t });

const manglerFeltVerdi = (felt) => {
  if (felt && !felt.valg) {
    return !StringUtils.harStrengInnhold(felt.feltVerdi);
  }
  return !felt;
};

const send_brev = object().shape({
  mottaker: string().nullable(),
  type: string().required(BREVMAL_MANGLER),
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
  // Dynamisk feltvalidering
  felt: object().test({
    name: "felt-validering",
    test: function (value, context) {
      const { valgtBrev } = context.parent;
      if (!valgtBrev?.felter) return true;

      let harFeil = false;
      const errors = {};

      valgtBrev.felter.forEach((brevFelt) => {
        if (!brevFelt.paakrevd) return;

        const feltverdi = value?.[brevFelt.kode];
        const harValgAlternativer = Boolean(brevFelt?.valg?.valgAlternativer);

        // Standard mangel per type
        const manglerValg = harValgAlternativer ? !feltverdi?.valg : false;
        const manglerFritekstStandard = !harValgAlternativer && !StringUtils.harStrengInnhold(feltverdi?.feltVerdi);

        // Finn ut om valgt alternativ for BREV_TITTEL krever fritekst, og om den mangler
        let manglerFritekstBrevOverskrift = false;
        if (brevFelt.kode === "BREV_TITTEL" && harValgAlternativer) {
          const valgtAlt = brevFelt.valg.valgAlternativer.find((a) => a.kode === feltverdi?.valg);
          const skalViseFritekst = valgtAlt?.visFelt !== false; // default true
          if (skalViseFritekst) {
            manglerFritekstBrevOverskrift = !StringUtils.harStrengInnhold(feltverdi?.feltVerdi);
          }
        }

        // Ingen avvik for dette feltet
        if (!manglerValg && !manglerFritekstStandard && !manglerFritekstBrevOverskrift) return;

        const visningsnavn = brevFelt.beskrivelse || brevFelt.navn || brevFelt.kode;

        if (!errors[brevFelt.kode]) errors[brevFelt.kode] = {};

        // Feil på valg (samme tekst som i oppsummeringen)
        if (manglerValg) {
          errors[brevFelt.kode].valg = toMelding(hentFeltFeilmelding(brevFelt.kode, visningsnavn));
          harFeil = true;
        }
        // Egen tekst for fritekst input under BREV_TITTEL, vises under fritekst-feltet
        if (manglerFritekstBrevOverskrift) {
          // Alltid bruk spesifikk melding når friteksten under BREV_TITTEL mangler
          errors[brevFelt.kode].feltVerdi = toMelding("Du må skrive inn overskrift til brevet");
          harFeil = true;
        }

        // Standard fritekst-feil for andre felt
        if (manglerFritekstStandard && brevFelt.kode !== "BREV_TITTEL") {
          errors[brevFelt.kode].feltVerdi = toMelding(hentFeltFeilmelding(brevFelt.kode, visningsnavn));
          harFeil = true;
        }
      });

      if (harFeil) {
        return this.createError({
          path: this.path,
          message: errors,
        });
      }
      return true;
    },
  }),

  // Ikke valider toppnivå fritekstTittel (feilen legges på felt.BREV_TITTEL.* over)
  fritekstTittel: string().nullable(),

  erFeltGyldig: string().when(["felt", "valgtBrev", "valgtMottaker", "type"], {
    is: (felt, valgtBrev, valgtMottaker, type) => {
      if (!valgtMottaker || !type || !valgtBrev?.felter) return false;
      return valgtBrev.felter.some((f) => f.paakrevd && (!felt?.[f.kode] || manglerFeltVerdi(felt?.[f.kode])));
    },
    then: (schema) =>
      schema.test({
        name: "detaljert-felt-validering",
        test: (_value, context) =>
          context.createError({
            message: true,
          }),
      }),
    otherwise: (schema) => schema.nullable(),
  }),
});

export default send_brev;
