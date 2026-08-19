import type { AnyObject, StringSchema, TestContext } from "yup";
import { array, object, string } from "yup";
import * as StringUtils from "../../../utils/streng";
import { erAnnenOrganisasjon, erArbeidsgiver, erVirksomhet, erNorskMyndighet } from "./brevMottaker/brevMottaker";
import { BrevFelt, ErrorsMap, Felt, Melding, SendBrevFormValues, ValgtMottakerType } from "./types";
import { ValgAlternativ } from "../../../services/modules/dokumenter-v2";

// Feilmeldinger for toppnivåfelter
const MOTTAKER_MANGLER: Melding = { melding: "Velg mottaker" };
const BREVMAL_MANGLER: Melding = { melding: "Velg brevmal" };
const ARBEIDSGIVER_MANGLER: Melding = { melding: "Velg arbeidsgiver" };
const ORGNUMMER_FELT_MANGLER: Melding = { melding: "Fyll ut organisasjonsnummer" };
const ORGNUMMER_UGYLDIG: Melding = { melding: "Ugyldig organisasjonsnummer" };
const NORSKE_MYNDIGHETER_MANGLER: Melding = { melding: "Du må velge minst én etat" };

// Ikke-feltbundne feilmeldinger (kontekst-/regel-baserte), avhengig av valgt brevmal
const STANDARDTEKST_ELLER_FRITEKST_MANGLER = { melding: "Du må velge minst én av standardtekst eller fritekst" };
const FRITEKST_HVA_MOTTAKER_SKAL_SENDE_INN_MANGLER = { melding: "Du må skrive inn hva mottaker skal sende inn" };
const OVERSKRIFT_FRITEKSTBREV_BRUKER_MANGLER = { melding: "Du må skrive inn overskrift til brevet" };
const INNLEDNINGSTEKST_MANGLERBREV_BRUKER_MANGLER = { melding: "Du må skrive inn innledningstekst i fritekstfeltet" };

// Feltspesifikke feilmeldinger som kan knyttes direkte til et felt via feltKode og som opptrer dynamisk avhengig av valgt brevmal
const FELT_FEILMELDINGER: Record<string, Melding> = {
  BREV_TITTEL: { melding: "Du må velge overskrift til brevet" },
  INNLEDNING_FRITEKST: { melding: "Du må skrive inn innledningstekst i fritekstfeltet" },
  MANGLER_FRITEKST: { melding: "Fritekst må fylles ut" },
  FRITEKST: { melding: "Du må skrive inn hovedtekst til brevet" },
  DISTRIBUSJONSTYPE: { melding: "Du må velge type brev" },
  UTENLANDSK_TRYGDEMYNDIGHET_MOTTAKER: { melding: "Du må velge trygdemyndighet" },
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

// Memoized index of valgAlternativer per brevmal (keyed by felter-array reference)
const felterAltCache = new WeakMap<FeltMedValg[], Map<string, Map<string, ValgAlternativ>>>();

function getValgAlternativIndex(felter: FeltMedValg[]): Map<string, Map<string, ValgAlternativ>> {
  const cached = felterAltCache.get(felter);
  if (cached) return cached;

  const byFelt = new Map<string, Map<string, ValgAlternativ>>();
  for (const f of felter) {
    const altArr = f.valg?.valgAlternativer || [];
    const altMap = new Map<string, ValgAlternativ>();
    for (const a of altArr) {
      altMap.set(a.kode, a);
    }
    byFelt.set(f.kode, altMap);
  }
  felterAltCache.set(felter, byFelt);
  return byFelt;
}

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
      const altIndex = getValgAlternativIndex(valgtBrev.felter);
      const valgtAlt = altIndex.get(brevFeltDef.kode)?.get(felt?.valg as string);
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
    is: (valgtMottaker: ValgtMottakerType | null) => erAnnenOrganisasjon(valgtMottaker?.rolle),
    then: (schema) => (schema as CustomSchema).erOrgnr(ORGNUMMER_UGYLDIG).required(ORGNUMMER_FELT_MANGLER),
    otherwise: (schema) => schema.nullable(),
  }),
  norskeMyndigheter: array()
    .of((string() as unknown as CustomSchema).erOrgnr(ORGNUMMER_UGYLDIG))
    .when("valgtMottaker", {
      is: (valgtMottaker: ValgtMottakerType | null) => erNorskMyndighet(valgtMottaker?.rolle),
      then: (schema) => schema.min(1, NORSKE_MYNDIGHETER_MANGLER),
      otherwise: (schema) => schema.nullable(),
    }),
  kontaktperson: string().nullable(),
  arbeidsgiver: string()
    .when("valgtMottaker", {
      is: (valgtMottaker: ValgtMottakerType | null) =>
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

      // Hoist brevtype checks and build cached index once per run
      const brevType = parent?.type;
      const erInnhentingAvInntektsopplysninger = brevType === "INNHENTING_AV_INNTEKTSOPPLYSNINGER";
      const erFritekstbrevBruker = brevType === "GENERELT_FRITEKSTBREV_BRUKER";
      const erMangelbrevBruker = brevType === "MANGELBREV_BRUKER";
      const erMangelbrevArbeidsgiver = brevType === "MANGELBREV_ARBEIDSGIVER";

      const altIndex = getValgAlternativIndex(valgtBrev.felter);

      let harFeil = false;
      const errors: ErrorsMap = {};

      if (erInnhentingAvInntektsopplysninger) {
        // Etter MELOSYS-8158 vises periode-avsnittet alltid (styrt av datoer), så standardtekst-
        // sjekkboksen er fjernet. Fritekst er nå et valgfritt tillegg; vi krever kun innhold når
        // fritekst faktisk er valgt.
        const valgtFritekst = value?.FRITEKST?.valg === "FRITEKST";

        if (valgtFritekst && !StringUtils.harStrengInnhold(value?.FRITEKST?.feltVerdi)) {
          if (!errors["FRITEKST"]) errors["FRITEKST"] = {};
          errors["FRITEKST"].feltVerdi = FRITEKST_HVA_MOTTAKER_SKAL_SENDE_INN_MANGLER;
          harFeil = true;
        }
      }

      valgtBrev.felter.forEach((brevFelt) => {
        const felt: Felt | undefined = value?.[brevFelt.kode];
        const valgtAlt = altIndex.get(brevFelt.kode)?.get((felt?.valg as string) || "");

        // Spesialregel: INNLEDNING_FRITEKST i mangelbrev skal først og fremst kreve et VALG, dersom det er valgalternativer
        if (
          brevFelt.kode === "INNLEDNING_FRITEKST" &&
          (erMangelbrevBruker || erMangelbrevArbeidsgiver) &&
          Boolean(brevFelt?.valg?.valgAlternativer)
        ) {
          // 1) Ingen valg gjort -> legg kun valg-feil, og ikke valider fritekst
          if (!felt?.valg) {
            if (!errors["INNLEDNING_FRITEKST"]) errors["INNLEDNING_FRITEKST"] = {};
            errors["INNLEDNING_FRITEKST"].valg = STANDARDTEKST_ELLER_FRITEKST_MANGLER;
            harFeil = true;
            return;
          }

          // 2) FRITEKST valgt og feltet skal vises -> krever fritekstinnhold
          const skalViseFritekst = valgtAlt?.visFelt !== false; // default true
          if (skalViseFritekst && !StringUtils.harStrengInnhold(felt?.feltVerdi)) {
            if (!errors["INNLEDNING_FRITEKST"]) errors["INNLEDNING_FRITEKST"] = {};
            errors["INNLEDNING_FRITEKST"].feltVerdi = INNLEDNINGSTEKST_MANGLERBREV_BRUKER_MANGLER;
            harFeil = true;
          }
          return;
        }

        // Spesialregel: BREV_TITTEL
        if (brevFelt.kode === "BREV_TITTEL") {
          const harValgAlternativer = Boolean(brevFelt?.valg?.valgAlternativer);

          if (harValgAlternativer) {
            // a) Ingen overskriftsvalg gjort -> valg-feil
            if (!felt?.valg) {
              if (!errors["BREV_TITTEL"]) errors["BREV_TITTEL"] = {};
              errors["BREV_TITTEL"].valg = hentFeltFeilmelding("BREV_TITTEL");
              harFeil = true;
              return;
            }

            // b) Fritekst-variant valgt og feltet skal vises -> krever feltVerdi
            const skalViseFritekst = valgtAlt?.visFelt !== false; // default true
            if (skalViseFritekst && !StringUtils.harStrengInnhold(felt?.feltVerdi)) {
              if (!errors["BREV_TITTEL"]) errors["BREV_TITTEL"] = {};
              errors["BREV_TITTEL"].feltVerdi = OVERSKRIFT_FRITEKSTBREV_BRUKER_MANGLER;
              harFeil = true;
            }
            return;
          } else if (brevFelt.paakrevd) {
            // c) Ingen valg-alternativer: påkrevd feltVerdi
            if (!StringUtils.harStrengInnhold(felt?.feltVerdi)) {
              if (!errors["BREV_TITTEL"]) errors["BREV_TITTEL"] = {};
              errors["BREV_TITTEL"].feltVerdi = OVERSKRIFT_FRITEKSTBREV_BRUKER_MANGLER;
              harFeil = true;
            }
            return;
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

        if (erFritekstbrevBruker && manglerFritekstBrevTittel) {
          errors[brevFelt.kode].feltVerdi = OVERSKRIFT_FRITEKSTBREV_BRUKER_MANGLER;
          harFeil = true;
        }

        if (erMangelbrevBruker && manglerInnledningFritekst) {
          errors[brevFelt.kode].feltVerdi = INNLEDNINGSTEKST_MANGLERBREV_BRUKER_MANGLER;
          harFeil = true;
        }

        if ((erMangelbrevBruker || erMangelbrevArbeidsgiver) && manglerFritekst) {
          errors[brevFelt.kode].feltVerdi = FRITEKST_HVA_MOTTAKER_SKAL_SENDE_INN_MANGLER;
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
