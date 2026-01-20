import { object, string, boolean, array } from "yup";

import MKV from "../../melosyskodeverk";
import * as Utils from "../../utils";
import * as KV from "../../kodeverk";

import { skalViseSoknadsperiodeOgLand } from "../../felleskomponenter/fagsakVelger/opprettSak";

const {
  MAA_FYLLES_UT,
  SKRIV_INN_GYLDIG_FNR_ELLER_DNR,
  FANT_INGEN_NAVN_PA_FNR_ELLER_DNR,
  SKRIV_INN_GYLDIG_ORGNR,
  FANT_INGEN_NAVN_PA_ORGNR,
  VELG_MINST_ETT_LAND,
  VELG_MINST_TO_LAND,
} = KV.Feilmeldinger;
const { BRUKER, VIRKSOMHET } = MKV.Koder.aktoersroller;

const VELG_SAKSTYPE = { melding: "Velg sakstype" };
const VELG_SAKSTEMA = { melding: "Velg sakstema" };
const VELG_BEHANDLINGSTYPE = { melding: "Velg behandlingstype" };
const VELG_BEHANDLINGSTEMA = { melding: "Velg behandlingstema" };
const VELG_BEHANDLINGSAARSAK = { melding: "Velg behandlingsårsak" };
const MAX_25_TEGN = { melding: "Årsak kan være maks 25 tegn" };
const FYLL_UT_MOTTAKSDATO = { melding: "Fyll ut mottaksdato" };
const VELG_HVILKEN_SAK_DU_ONSKER_A_KNYTTE_BEHANDLINGEN_TIL = {
  melding: "Velg hvilken sak du ønsker å knytte behandlingen til",
};
const DU_KAN_IKKE_OPPRETTE = {
  melding: "Du kan ikke opprette en ny behandling på valgt sak",
};

const skalOppretteNySak = (saksnummer) => saksnummer === "-1";

const kreverPeriode = (saksnummer, sakstype, sakstema, behandlingstema, behandlingstype) =>
  skalOppretteNySak(saksnummer) && skalViseSoknadsperiodeOgLand(sakstype, sakstema, behandlingstema, behandlingstype);

const kreverLand = (
  saksnummer,
  sakstype,
  sakstema,
  behandlingstema,
  behandlingstype,
  soknadslandFlereLandUkjentHvilke,
) =>
  kreverPeriode(saksnummer, sakstype, sakstema, behandlingstema, behandlingstype) && !soknadslandFlereLandUkjentHvilke;

const opprettnysak = object().shape({
  hovedpart: string().required(MAA_FYLLES_UT),
  brukerID: string()
    .when("hovedpart", {
      is: (hovedpart) => hovedpart === BRUKER,
      then: (schema) =>
        schema.erFnrEllerDnr(SKRIV_INN_GYLDIG_FNR_ELLER_DNR).required(SKRIV_INN_GYLDIG_FNR_ELLER_DNR).nullable(),
    })
    .when(["hovedpart", "brukerNavn"], {
      is: (hovedpart, brukerNavn) =>
        hovedpart === BRUKER && (brukerNavn === null || brukerNavn === undefined || brukerNavn === ""),
      then: (schema) => schema.harIkkeFnrEllerDnrLengde(FANT_INGEN_NAVN_PA_FNR_ELLER_DNR).nullable(),
    })
    .nullable(),
  brukerNavn: string().nullable(),
  virksomhetOrgnr: string()
    .when("hovedpart", {
      is: (hovedpart) => hovedpart === VIRKSOMHET,
      then: (schema) => schema.erOrgnr(SKRIV_INN_GYLDIG_ORGNR).required(SKRIV_INN_GYLDIG_ORGNR).nullable(),
    })
    .when(["hovedpart", "virksomhetNavn"], {
      is: (hovedpart, virksomhetNavn) =>
        hovedpart === VIRKSOMHET && (virksomhetNavn === null || virksomhetNavn === undefined || virksomhetNavn === ""),
      then: (schema) => schema.harIkkeOrgnrLengde(FANT_INGEN_NAVN_PA_ORGNR).nullable(),
    })
    .nullable(),
  virksomhetNavn: string().nullable(),
  saksnummer: string()
    .nullable()
    .test(
      "Må settes når du knytter til eksisterende sak",
      VELG_HVILKEN_SAK_DU_ONSKER_A_KNYTTE_BEHANDLINGEN_TIL,
      (saksnummer) => skalOppretteNySak(saksnummer) || !Utils._isEmpty(saksnummer),
    ),
  sakstype: string().when("saksnummer", {
    is: skalOppretteNySak,
    then: (schema) => schema.required(VELG_SAKSTYPE),
    otherwise: (schema) => schema.nullable(),
  }),
  sakstema: string().when("saksnummer", {
    is: skalOppretteNySak,
    then: (schema) => schema.required(VELG_SAKSTEMA),
    otherwise: (schema) => schema.nullable(),
  }),
  behandlingstema: string().when("saksnummer", {
    is: skalOppretteNySak,
    then: (schema) => schema.required(VELG_BEHANDLINGSTEMA),
    otherwise: (schema) => schema.nullable(),
  }),
  behandlingstype: string().when("saksnummer", {
    is: skalOppretteNySak,
    then: (schema) => schema.required(VELG_BEHANDLINGSTYPE),
    otherwise: (schema) => schema.nullable(),
  }),
  periodeFraOgMed: string()
    .nullable()
    .when(["saksnummer", "sakstype", "sakstema", "behandlingstema", "behandlingstype"], {
      is: kreverPeriode,
      then: (schema) => schema.required(MAA_FYLLES_UT).erGyldigDato().nullable(),
    }),
  periodeTilOgMed: string().nullable().erEtterDatofelt("periodeFraOgMed").erGyldigDato(),
  soknadslandFlereLandUkjentHvilke: boolean().nullable(),
  soknadsland: array().when(
    ["saksnummer", "sakstype", "sakstema", "behandlingstema", "behandlingstype", "soknadslandFlereLandUkjentHvilke"],
    {
      is: kreverLand,
      then: (schema) =>
        schema.when("behandlingstema", {
          is: MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND,
          then: (schemaInner) => schemaInner.min(2, { _error: VELG_MINST_TO_LAND }),
          otherwise: (schemaInner) => schemaInner.min(1, { _error: VELG_MINST_ETT_LAND }),
        }),
    },
  ),
  mottaksdato: string().erGyldigDato().required(FYLL_UT_MOTTAKSDATO),
  behandlingsaarsakType: string().required(VELG_BEHANDLINGSAARSAK),
  behandlingsaarsakFritekst: string().when(["behandlingsaarsakType"], {
    is: (behandlingsaarsakType) => behandlingsaarsakType === MKV.Koder.behandlinger.behandlingsaarsaktyper.FRITEKST,
    then: (schema) => schema.max(25, MAX_25_TEGN).required(VELG_BEHANDLINGSAARSAK),
    otherwise: (schema) => schema.nullable(),
  }),
  opprettBehandling: boolean().when("saksnummer", {
    is: (saksnummer) =>
      !skalOppretteNySak(saksnummer) && saksnummer !== null && saksnummer !== undefined && saksnummer !== "",
    then: (schema) => schema.oneOf([true], DU_KAN_IKKE_OPPRETTE),
    otherwise: (schema) => schema.nullable(),
  }),
});

export default opprettnysak;
