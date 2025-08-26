import type { AnyObject, StringSchema, TestContext } from "yup";
import { array, object, string } from "yup";
import * as StringUtils from "../../../utils/streng";
import { erAnnenOrganisasjon, erArbeidsgiver, erVirksomhet } from "./brevMottaker/brevMottaker";
import type { BrevFelt, Felt, SendBrevFormValues, Melding, ErrorsMap } from "./types";
import { ValgAlternativ } from "../../../services/modules/dokumenter-v2";

// Feilmeldinger for toppnivåfelter
const MOTTAKER_MANGLER: Melding = { melding: "Velg mottaker" };
const BREVMAL_MANGLER: Melding = { melding: "Velg brevmal" };
const ARBEIDSGIVER_MANGLER: Melding = { melding: "Velg arbeidsgiver" };
const ORGNUMMER_FELT_MANGLER: Melding = { melding: "Fyll ut organisasjonsnummer" };
const ORGNUMMER_UGYLDIG: Melding = { melding: "Ugyldig organisasjonsnummer" };

// Ikke-feltbundne feilmeldinger (kontekst-/regel-baserte), avhengig av valgt brevmal
const STANDARDTEKST_ELLER_FRITEKST_MANGLER = { melding: "Du må velge minst én av standardtekst eller fritekst" };
const INNTEKTSOPPLYSNINGER_FRITEKST_MANGLER = { melding: "Du må skrive inn hva mottaker skal sende inn" };
const FRITEKST_MANGLERBREV_MANGLER = { melding: "Du må skrive inn i hva mottaker skal sende inn" };
const OVERSKRIFT_FRITEKSTRBREV_BRUKER_MANGLER = { melding: "Du må skrive inn overskrift til brevet" };
const INNLEDNINGSTEKST_MANGELRBREV_BRUKER_MANGLER = { melding: "Du må skrive inn innledningstekst i fritekstfeltet" };

// Feltspesifikke feilmeldinger som kan knyttes direkte til et felt via feltKode og som opptrer dynamisk avhengig av valgt brevmal
const FELT_FEILMELDINGER: Record<string, Melding> = {
  BREV_TITTEL: { melding: "Du må velge overskrift til brevet" },
  INNLEDNING_FRITEKST: { melding: "Du må skrive inn innledningstekst i fritekstfeltet" },
  MANGLER_FRITEKST: { melding: "Fritekst må fylles ut" },
  FRITEKST: { melding: "Du må skrive inn hovedtekst til brevet" },
  DISTRIBUSJONSTYPE: { melding: "Du må velge type brev" },
};

export const hentFeltFeilmelding = (feltKode: string): Melding => {
  return FELT_FEILMELDINGER[feltKode] ?? { melding: "Feltet '" + feltKode + "' må fylles ut" };
};

const feltHarInnhold = (felt?: Felt): boolean => {
  if (!felt) return false;
  if (felt.valg) return true;
  return StringUtils.harStrengInnhold(felt.feltVerdi);
};

interface FeltMedValg extends BrevFelt {
  navn?: string;
  beskrivelse?: string;
  valg?: { valgAlternativer?: ValgAlternativ[] } | null;
}

// Felles helper for komponentene: vurderer påkrevd/mangler for et gitt felt
export type PåkrevdMangler = {
  erPaakrevd: boolean;
  valgMangler: boolean;
  fritekstMangler: boolean;
};

export function vurderPåkrevdOgMangler(values: SendBrevFormValues | undefined, feltKode: string): PåkrevdMangler {
  const valgtBrev = values?.valgtBrev as { felter?: FeltMedValg[] } | undefined;
  if (!valgtBrev?.felter) {
    return { erPaakrevd: false, valgMangler: false, fritekstMangler: false };
  }

  const brevFeltDef = valgtBrev.felter.find((f) => f.kode === feltKode);
  const erPaakrevd = !!brevFeltDef?.paakrevd;
  if (!erPaakrevd) {
    return { erPaakrevd: false, valgMangler: false, fritekstMangler: false };
  }

  const felt: Felt | undefined = values?.felt?.[feltKode];

  // Felt med valg
  if (brevFeltDef?.valg?.valgAlternativer && brevFeltDef.valg.valgAlternativer.length > 0) {
    const valgMangler = !felt?.valg;
    let fritekstMangler = false;

    if (!valgMangler) {
      const valgtAlt = brevFeltDef.valg.valgAlternativer.find((a) => a.kode === felt?.valg);
      const skalViseFritekst = valgtAlt?.visFelt !== false; // default true
      if (skalViseFritekst) {
        fritekstMangler = !StringUtils.harStrengInnhold(felt?.feltVerdi);
      }
    }

    return { erPaakrevd: true, valgMangler, fritekstMangler };
  }

  // Felt uten valg krever fritekst
  const fritekstMangler = !StringUtils.harStrengInnhold(felt?.feltVerdi);
  return { erPaakrevd: true, valgMangler: false, fritekstMangler };
}

interface CustomSchema extends StringSchema<string | undefined, AnyObject> {
  erOrgnr: (message: Melding) => this;
}

const send_brev = object({
  mottaker: string().nullable(),
  type: string().required(BREVMAL_MANGLER),
  valgtMottaker: object().required(MOTTAKER_MANGLER),
  organisasjonsnummer: string().when("valgtMottaker", {
    is: (valgtMottaker: { rolle?: string } | null) => erAnnenOrganisasjon(valgtMottaker?.rolle),
    then: (schema) => (schema as CustomSchema).erOrgnr(ORGNUMMER_UGYLDIG).required(ORGNUMMER_FELT_MANGLER),
    otherwise: (schema) => schema.nullable(),
  }),
  norskeMyndigheter: array().of((string() as unknown as CustomSchema).erOrgnr(ORGNUMMER_UGYLDIG)),
  kontaktperson: string().nullable(),
  arbeidsgiver: string()
    .when("valgtMottaker", {
      is: (valgtMottaker: { rolle?: string } | null) =>
        erVirksomhet(valgtMottaker?.rolle) || erArbeidsgiver(valgtMottaker?.rolle),
      then: (schema) => schema.required(ARBEIDSGIVER_MANGLER),
      otherwise: (schema) => schema.nullable(),
    })
    .nullable(),

  /*
   * Custom Yup-test for dynamiske brevfelter (felt) basert på valgt brevmal.
   * Merk: Felt som ikke er markert som påkrevd valideres kun når det finnes særregler
   * for aktuell brevtype. Ellers ignoreres de.
   */
  felt: object().test({
    name: "felt-validering",
    test: function (value: Record<string, Felt> | undefined, context: TestContext) {
      const parent = context.parent as SendBrevFormValues | undefined;
      const valgtBrev = parent?.valgtBrev as { felter?: FeltMedValg[] } | undefined;
      if (!valgtBrev?.felter) return true;

      let harFeil = false;
      const errors: ErrorsMap = {};

      if (parent?.type === "INNHENTING_AV_INNTEKTSOPPLYSNINGER") {
        const standardNode = value?.STANDARDTEKST_INNTEKTSOPPLYSNINGER;
        const valgtStandardtekst = Boolean(standardNode?.valg) || Boolean((standardNode as Felt)?.feltVerdi);
        const valgtFritekst = value?.FRITEKST?.valg === "FRITEKST";

        if (!valgtStandardtekst && !valgtFritekst) {
          if (!errors["FRITEKST"]) errors["FRITEKST"] = {};
          errors["FRITEKST"].valg = STANDARDTEKST_ELLER_FRITEKST_MANGLER;
          harFeil = true;
        }
      }

      valgtBrev.felter.forEach((brevFelt) => {
        const felt: Felt | undefined = value?.[brevFelt.kode];
        const valgtAlt = (brevFelt.valg?.valgAlternativer || []).find((a) => a.kode === felt?.valg);

        // Handter valideringsregler for enkelt-felt som ikke er markert som påkrevd
        if (parent?.type === "INNHENTING_AV_INNTEKTSOPPLYSNINGER") {
          // Dersom "Fritekst" er valgt, må fritekstfeltet også ha verdi, hvis ikke vises en feimlmelding.
          let manglerInntektsOpplysningerFriktekst = false;
          if (brevFelt.kode === "FRITEKST") {
            const valgtFritekst = Boolean(value?.FRITEKST?.valg);
            manglerInntektsOpplysningerFriktekst =
              valgtFritekst &&
              valgtAlt?.visFelt !== false &&
              !StringUtils.harStrengInnhold(felt?.feltVerdi as string | undefined);
          }

          if (manglerInntektsOpplysningerFriktekst) {
            if (!errors[brevFelt.kode]) errors[brevFelt.kode] = {};
            errors[brevFelt.kode].feltVerdi = INNTEKTSOPPLYSNINGER_FRITEKST_MANGLER;
            harFeil = true;
          }
        }

        if (!brevFelt.paakrevd) return;

        // Handter felt som er markert som påkrevd

        const harValgAlternativer = Boolean(brevFelt?.valg?.valgAlternativer);

        const manglerValg = harValgAlternativer ? !felt?.valg : false;
        const manglerFritekstStandard = !harValgAlternativer && !feltHarInnhold(felt);

        let manglerFritekstBrevTittel = false;
        if (brevFelt.kode === "BREV_TITTEL" && harValgAlternativer) {
          manglerFritekstBrevTittel =
            valgtAlt?.visFelt !== false &&
            !StringUtils.harStrengInnhold(felt?.feltVerdi) &&
            valgtAlt?.kode === "FRITEKST_BRUKER_OG_VIRKSOMHET";
        }

        let manglerInnledningFritekst = false;
        if (brevFelt.kode === "INNLEDNING_FRITEKST" && harValgAlternativer) {
          manglerInnledningFritekst = valgtAlt?.visFelt !== false && !StringUtils.harStrengInnhold(felt?.feltVerdi);
        }

        let manglerFritekst = false;
        if (brevFelt.kode === "MANGLER_FRITEKST") {
          manglerFritekst = valgtAlt?.visFelt !== false && !StringUtils.harStrengInnhold(felt?.feltVerdi);
        }

        if (
          !manglerValg &&
          !manglerFritekstStandard &&
          !manglerFritekstBrevTittel &&
          !manglerInnledningFritekst &&
          !manglerFritekst
        )
          return;

        if (!errors[brevFelt.kode]) errors[brevFelt.kode] = {};

        if (manglerValg) {
          errors[brevFelt.kode].valg = hentFeltFeilmelding(brevFelt.kode);
          harFeil = true;
        }

        if (parent?.type === "GENERELT_FRITEKSTBREV_BRUKER" && manglerFritekstBrevTittel) {
          errors[brevFelt.kode].feltVerdi = OVERSKRIFT_FRITEKSTRBREV_BRUKER_MANGLER;
          harFeil = true;
        }

        if (parent?.type === "MANGELBREV_BRUKER" && manglerInnledningFritekst) {
          errors[brevFelt.kode].feltVerdi = INNLEDNINGSTEKST_MANGELRBREV_BRUKER_MANGLER;
          harFeil = true;
        }

        if ((parent?.type === "MANGELBREV_BRUKER" || parent?.type === "MANGELBREV_ARBEIDSGIVER") && manglerFritekst) {
          errors[brevFelt.kode].feltVerdi = FRITEKST_MANGLERBREV_MANGLER;
          harFeil = true;
        }

        // Sett generisk fritekst-feil kun dersom feltet ikke allerede har en spesifikk feltVerdi-feil
        if (manglerFritekstStandard && brevFelt.kode !== "BREV_TITTEL" && !errors[brevFelt.kode]?.feltVerdi) {
          errors[brevFelt.kode].feltVerdi = hentFeltFeilmelding(brevFelt.kode);
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
