import type { TestContext } from "yup";
import { array, object, string } from "yup";
import * as StringUtils from "../../../utils/streng";
import { erAnnenOrganisasjon, erArbeidsgiver, erVirksomhet } from "./brevMottaker/brevMottaker";
import type { BrevFelt, FeltVerdi, SendBrevFormValues, Melding } from "./types";
import { ValgAlternativ } from "../../../services/modules/dokumenter-v2";

type FeltbladError = { feltVerdi?: Melding; valg?: Melding };
type ErrorsMap = Record<string, FeltbladError>;

const BREVMAL_MANGLER: Melding = { melding: "Velg brevmal" };
const MOTTAKER_MANGLER: Melding = { melding: "Velg mottaker" };
const ARBEIDSGIVER_MANGLER: Melding = { melding: "Velg arbeidsgiver" };
const ORGNUMMER_FELT_MANGLER: Melding = { melding: "Fyll ut organisasjonsnummer" };
const ORGNUMMER_UGYLDIG: Melding = { melding: "Ugyldig organisasjonsnummer" };

const FELT_FEILMELDINGER: Record<string, Melding> = {
  BREV_TITTEL: { melding: "Du må velge overskrift til brevet" },
  INNLEDNING_FRITEKST: { melding: "Du må velge innledningstekst" },
  MANGLER_FRITEKST: { melding: "Fritekst må fylles ut" },
  FRITEKST: { melding: "Du må skrive inn hovedtekst til brevet" },
  DISTRIBUSJONSTYPE: { melding: "Du må velge type brev" },
};

const FELT_VERDI_MAA_FYLLES_UT = (feltNavn: string) => `${feltNavn} må fylles ut`;

export const hentFeltFeilmelding = (feltKode: string, visningsnavn: string): Melding => {
  return FELT_FEILMELDINGER[feltKode] || toMelding(FELT_VERDI_MAA_FYLLES_UT(visningsnavn));
};

const toMelding = (t: string): Melding => ({ melding: t });

// Robust sjekk for om et felt er "satt", uansett type (valg/checkbox/fritekst)
const feltHarInnhold = (fv?: FeltVerdi): boolean => {
  if (!fv) return false;
  if (fv.valg) return true;
  const raw = (fv as any).feltVerdi;
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "string") return StringUtils.harStrengInnhold(raw);
  return false;
};

interface FeltMedValg extends BrevFelt {
  navn?: string;
  beskrivelse?: string;
  valg?: { valgAlternativer?: ValgAlternativ[] } | null;
}

const send_brev = object({
  mottaker: string().nullable(),
  type: string().required(BREVMAL_MANGLER),
  valgtMottaker: object().required(MOTTAKER_MANGLER),
  organisasjonsnummer: string().when("valgtMottaker", {
    is: (valgtMottaker: { rolle?: string } | null) => erAnnenOrganisasjon(valgtMottaker?.rolle),
    then: (schema) => (schema as any).erOrgnr(ORGNUMMER_UGYLDIG).required(ORGNUMMER_FELT_MANGLER),
    otherwise: (schema) => schema.nullable(),
  }),
  norskeMyndigheter: array().of((string() as any).erOrgnr(ORGNUMMER_UGYLDIG)),
  kontaktperson: string().nullable(),
  arbeidsgiver: string()
    .when("valgtMottaker", {
      is: (valgtMottaker: { rolle?: string } | null) =>
        erVirksomhet(valgtMottaker?.rolle) || erArbeidsgiver(valgtMottaker?.rolle),
      then: (schema) => schema.required(ARBEIDSGIVER_MANGLER),
      otherwise: (schema) => schema.nullable(),
    })
    .nullable(),

  felt: object().test({
    name: "felt-validering",
    test: function (value: Record<string, FeltVerdi> | undefined, context: TestContext) {
      const parent = context.parent as SendBrevFormValues | undefined;
      const valgtBrev = parent?.valgtBrev as { felter?: FeltMedValg[] } | undefined;
      if (!valgtBrev?.felter) return true;

      let harFeil = false;
      const errors: ErrorsMap = {};

      // Handter valideringsregler som omfatter flere felt som ikke er markert som påkrevd
      if (parent?.type === "INNHENTING_AV_INNTEKTSOPPLYSNINGER") {
        // Regel: Minst en av checkboksene STANDARDTEKST_INNTEKTSOPPLYSNINGER og FRITEKST
        // må være valgt.

        const valgtStandardtekst = Boolean((value?.STANDARDTEKST_INNTEKTSOPPLYSNINGER as any)?.feltVerdi === true);
        const valgtFritekst = value?.FRITEKST?.valg === "FRITEKST";

        if (!valgtStandardtekst && !valgtFritekst) {
          if (!errors["FRITEKST"]) errors["FRITEKST"] = {};
          errors["FRITEKST"].valg = toMelding("Du må velge minst én av standardtekst eller fritekst");
          harFeil = true;
        }
      }

      valgtBrev.felter.forEach((brevFelt) => {
        const feltverdi = value?.[brevFelt.kode];
        const valgtAlt = (brevFelt.valg?.valgAlternativer || []).find((a) => a.kode === feltverdi?.valg);

        // Handter valideringsregler for enkelt-felt som ikke er markert som påkrevd
        if (parent?.type === "INNHENTING_AV_INNTEKTSOPPLYSNINGER") {
          // Dersom "Fritekst" er valgt, må fritekstfeltet også ha verdi, hvis ikke vises en feimlmelding.
          let manglerInntektsOpplysningerFriktekst = false;
          if (brevFelt.kode === "FRITEKST") {
            const valgtFritekst = Boolean(value?.FRITEKST?.valg);
            manglerInntektsOpplysningerFriktekst =
              valgtFritekst && valgtAlt?.visFelt !== false && !StringUtils.harStrengInnhold(feltverdi?.feltVerdi);
          }

          if (manglerInntektsOpplysningerFriktekst) {
            if (!errors[brevFelt.kode]) errors[brevFelt.kode] = {};
            errors[brevFelt.kode].feltVerdi = toMelding("Du må skrive inn hva mottaker skal sende inn");
            harFeil = true;
          }
        }

        if (!brevFelt.paakrevd) return;
        // Handter felt som er markert som påkrevd

        const harValgAlternativer = Boolean(brevFelt?.valg?.valgAlternativer);

        const manglerValg = harValgAlternativer ? !feltverdi?.valg : false;
        const manglerFritekstStandard = !harValgAlternativer && !feltHarInnhold(feltverdi);

        let manglerFritekstBrevTittel = false;
        if (brevFelt.kode === "BREV_TITTEL" && harValgAlternativer) {
          manglerFritekstBrevTittel =
            valgtAlt?.visFelt !== false &&
            !StringUtils.harStrengInnhold(feltverdi?.feltVerdi) &&
            valgtAlt?.kode === "FRITEKST_BRUKER_OG_VIRKSOMHET";
        }

        let manglerFritekstInnledning = false;
        if (brevFelt.kode === "INNLEDNING_FRITEKST" && harValgAlternativer) {
          manglerFritekstInnledning =
            valgtAlt?.visFelt !== false && !StringUtils.harStrengInnhold(feltverdi?.feltVerdi);
        }

        let manglerFritekstInnledningsTekst = false;
        if (brevFelt.kode === "MANGLER_FRITEKST") {
          manglerFritekstInnledningsTekst =
            valgtAlt?.visFelt !== false && !StringUtils.harStrengInnhold(feltverdi?.feltVerdi);
        }

        if (
          !manglerValg &&
          !manglerFritekstStandard &&
          !manglerFritekstBrevTittel &&
          !manglerFritekstInnledning &&
          !manglerFritekstInnledningsTekst
        )
          return;

        const visningsnavn = (brevFelt as any).beskrivelse || (brevFelt as any).navn || brevFelt.kode;
        if (!errors[brevFelt.kode]) errors[brevFelt.kode] = {};

        if (manglerValg) {
          errors[brevFelt.kode].valg = hentFeltFeilmelding(brevFelt.kode, visningsnavn);
          harFeil = true;
        }

        if (parent?.type === "GENERELT_FRITEKSTBREV_BRUKER" && manglerFritekstBrevTittel) {
          errors[brevFelt.kode].feltVerdi = toMelding("Du må skrive inn overskrift til brevet");
          harFeil = true;
        }

        if (parent?.type === "MANGELBREV_BRUKER" && manglerFritekstInnledning) {
          errors[brevFelt.kode].feltVerdi = toMelding("Du må skrive inn innledningstekst i fritekstfeltet");
          harFeil = true;
        }

        if (parent?.type === "MANGELBREV_BRUKER" && manglerFritekstInnledningsTekst) {
          errors[brevFelt.kode].feltVerdi = toMelding("Hva skal mottaker sende inn?");
          harFeil = true;
        }

        if (manglerFritekstStandard && brevFelt.kode !== "BREV_TITTEL") {
          errors[brevFelt.kode].feltVerdi = hentFeltFeilmelding(brevFelt.kode, visningsnavn);
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

  fritekstTittel: string().nullable(),
});

export default send_brev;
