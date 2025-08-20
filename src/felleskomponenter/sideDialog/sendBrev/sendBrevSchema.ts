import type { TestContext } from "yup";
import { array, object, string } from "yup";
import * as StringUtils from "../../../utils/streng";
import { erAnnenOrganisasjon, erArbeidsgiver, erVirksomhet } from "./brevMottaker/brevMottaker";
import type { BrevFelt, FeltVerdi, SendBrevFormValues } from "./types";
import { ValgAlternativ } from "../../../services/modules/dokumenter-v2";

type Melding = { melding: string };
type FeltbladError = { feltVerdi?: Melding; valg?: Melding };
type ErrorsMap = Record<string, FeltbladError>;

const BREVMAL_MANGLER: Melding = { melding: "Velg brevmal" };
const MOTTAKER_MANGLER: Melding = { melding: "Velg mottaker" };
const ARBEIDSGIVER_MANGLER: Melding = { melding: "Velg arbeidsgiver" };
const ORGNUMMER_FELT_MANGLER: Melding = { melding: "Fyll ut organisasjonsnummer" };
const ORGNUMMER_UGYLDIG: Melding = { melding: "Ugyldig organisasjonsnummer" };

const FELT_FEILMELDINGER: Record<string, Melding> = {
  BREV_TITTEL: { melding: "Du må velge overskrift til brevet" },
  INNLEDNING_FRITEKST: { melding: "Fyll inn innledning" },
  MANGLER_FRITEKST: { melding: "Fritekst må fylles ut" },
  FRITEKST: { melding: "Du må skrive inn hovedtekst til brevet" },
  DISTRIBUSJONSTYPE: { melding: "Du må velge type brev" },
};

const FELT_VERDI_MAA_FYLLES_UT = (feltNavn: string) => `${feltNavn} må fylles ut`;

export const hentFeltFeilmelding = (feltKode: string, visningsnavn: string): string =>
  FELT_FEILMELDINGER[feltKode]?.melding || FELT_VERDI_MAA_FYLLES_UT(visningsnavn);

const toMelding = (t: string): Melding => ({ melding: t });

// Bruk FeltVerdi fra types.ts
type FeltverdiValue = FeltVerdi | undefined;
const manglerFeltVerdi = (felt: FeltverdiValue): boolean => {
  if (felt && !felt.valg) {
    return !StringUtils.harStrengInnhold(felt.feltVerdi);
  }
  return !felt;
};

type FeltMedValg = BrevFelt & {
  navn?: string;
  beskrivelse?: string;
  valg?: { valgAlternativer?: ValgAlternativ[] } | null;
};

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
      const valgtBrev = (context.parent as SendBrevFormValues | undefined)?.valgtBrev as
        | { felter?: FeltMedValg[] }
        | undefined;
      if (!valgtBrev?.felter) return true;

      let harFeil = false;
      const errors: ErrorsMap = {};

      valgtBrev.felter.forEach((brevFelt: FeltMedValg) => {
        if (!brevFelt.paakrevd) return;

        const feltverdi = value?.[brevFelt.kode];
        const harValgAlternativer = Boolean(brevFelt?.valg?.valgAlternativer);

        const manglerValg = harValgAlternativer ? !feltverdi?.valg : false;
        const manglerFritekstStandard = !harValgAlternativer && !StringUtils.harStrengInnhold(feltverdi?.feltVerdi);

        let manglerFritekstBrevTittel = false;
        let valgtAltKode: string | undefined = undefined;

        if (brevFelt.kode === "BREV_TITTEL" && harValgAlternativer) {
          const valgtAlt = (brevFelt.valg?.valgAlternativer || []).find((a) => a.kode === feltverdi?.valg);
          valgtAltKode = valgtAlt?.kode;
          const skalViseFritekst = valgtAlt?.visFelt !== false; // default true
          if (skalViseFritekst) {
            manglerFritekstBrevTittel = !StringUtils.harStrengInnhold(feltverdi?.feltVerdi);
          }
        }

        if (!manglerValg && !manglerFritekstStandard && !manglerFritekstBrevTittel) return;

        const visningsnavn = (brevFelt as any).beskrivelse || (brevFelt as any).navn || brevFelt.kode;
        if (!errors[brevFelt.kode]) errors[brevFelt.kode] = {};

        if (manglerValg) {
          errors[brevFelt.kode].valg = toMelding(hentFeltFeilmelding(brevFelt.kode, visningsnavn));
          harFeil = true;
        }

        // Spesifikk feilmelding under fritekstfeltet for BREV_TITTEL i fritekstbrev for bruker
        if (
          manglerFritekstBrevTittel &&
          (context.parent as SendBrevFormValues | undefined)?.type === "GENERELT_FRITEKSTBREV_BRUKER" &&
          valgtAltKode === "FRITEKST_BRUKER_OG_VIRKSOMHET"
        ) {
          errors[brevFelt.kode].feltVerdi = toMelding("Du må skrive inn hovedtekst til brevet");
          harFeil = true;
        }

        // Standard fritekst-feil for andre felt (og BREV_TITTEL når spesifikk regel ikke traff)
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

  fritekstTittel: string().nullable(),

  erFeltGyldig: string().when(["felt", "valgtBrev", "valgtMottaker", "type"], {
    is: (
      felt: Record<string, FeltVerdi> | undefined,
      valgtBrev: { felter?: BrevFelt[] } | undefined,
      valgtMottaker: unknown,
      type: string | undefined,
    ) => {
      if (!valgtMottaker || !type || !valgtBrev?.felter) return false;
      return valgtBrev.felter.some((f) => f.paakrevd && (!felt?.[f.kode] || manglerFeltVerdi(felt?.[f.kode])));
    },
    then: (schema) =>
      schema.test({
        name: "detaljert-felt-validering",
        test: (_value, context) =>
          context.createError({
            message: true as unknown as string,
          }),
      }),
    otherwise: (schema) => schema.nullable(),
  }),
});

export default send_brev;
