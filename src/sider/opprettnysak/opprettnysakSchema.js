import { object, string, mixed, array, lazy, boolean } from "yup";

import * as Utils from "../../utils";
import * as KV from "../../kodeverk";

import MKV, { MKVUtils } from "../../melosyskodeverk";

const SKRIV_INN_FNR_ELLER_DNR = { melding: "Skriv inn f.nr eller d.nr" };
const SKRIV_INN_GYLDIG_FNR_ELLER_DNR = { melding: "Skriv inn gyldig f.nr eller d.nr" };
const FANT_INGEN_NAVN_PA_FNR_ELLER_DNR = { melding: "Fant ingen navn på dette f.nr eller d.nr." };
const SKRIV_INN_ORGNR = { melding: "Skriv inn organisasjonsnummer" };
const SKRIV_INN_GYLDIG_ORGNR = { melding: "Skriv inn gyldig organisasjonsnummer" };
const FANT_INGEN_NAVN_PA_ORGNR = { melding: "Fant ingen navn på dette organisasjonsnummeret." };
const VELG_SAKSTYPE = { melding: "Velg sakstype" };
// TODO: Legg denne på når toggle melosys.sakstema er på. Da skal sakstema og behandlingstype bli required
// const VELG_SAKSTEMA = { melding: "Velg sakstema" };
// const VELG_BEHANDLINGSTYPE = { melding: "Velg behandlingstype" };
const VELG_BEHANDLINGSTEMA = { melding: "Velg behandlingstema" };
const VELG_LAND = { melding: "Velg land" };
const VELG_EN_OPPGAVE = { melding: "Velg en oppgave" };
const MANGLER_JOURNALPOST = { melding: "Den valgte oppgaven har ingen journalpost" };
const { MAA_FYLLES_UT } = KV.Feilmeldinger;
const { BRUKER, VIRKSOMHET } = MKV.Koder.aktoersroller;

const soknadsinfo = object().shape({
  fom: string().erGyldigDato().required(MAA_FYLLES_UT),
  tom: lazy((value) =>
    !value ? string().ensure() : string().erGyldigDato().erEtterDatofelt("fom").required(MAA_FYLLES_UT)
  ),
  landkoder: array()
    .of(string())
    .when("erUkjenteEllerAlleEosLand", {
      is: false,
      then: array().of(string()).min(1, { _error: VELG_LAND }),
    }),
  erUkjenteEllerAlleEosLand: boolean(),
});

const opprettnysak = object().shape({
  hovedpart: string().required(MAA_FYLLES_UT),
  brukerID: string()
    .when("hovedpart", {
      is: (hovedpart) => hovedpart === BRUKER,
      then: string().erFnrEllerDnr(SKRIV_INN_GYLDIG_FNR_ELLER_DNR).required(SKRIV_INN_FNR_ELLER_DNR).nullable(),
    })
    .when(["hovedpart", "brukerNavn"], {
      is: (hovedpart, brukerNavn) => hovedpart === BRUKER && Utils._isEmpty(brukerNavn),
      then: string().harIkkeFnrEllerDnrLengde(FANT_INGEN_NAVN_PA_FNR_ELLER_DNR).nullable(),
    })
    .nullable(),
  brukerNavn: mixed(),
  virksomhetOrgnr: string()
    .when("hovedpart", {
      is: (hovedpart) => hovedpart === VIRKSOMHET,
      then: string().erOrgnr(SKRIV_INN_GYLDIG_ORGNR).required(SKRIV_INN_ORGNR).nullable(),
    })
    .when(["hovedpart", "virksomhetNavn"], {
      is: (hovedpart, virksomhetNavn) => hovedpart === VIRKSOMHET && Utils._isEmpty(virksomhetNavn),
      then: string().harIkkeOrgnrLengde(FANT_INGEN_NAVN_PA_ORGNR).nullable(),
    })
    .nullable(),
  virksomhetNavn: string().nullable(),
  sakstype: string().required(VELG_SAKSTYPE).nullable(),
  sakstema: string().nullable(),
  behandlingstype: string().nullable(),
  behandlingstema: string()
    .when("hovedpart", {
      is: (hovedpart) => hovedpart !== VIRKSOMHET,
      then: string().required(VELG_BEHANDLINGSTEMA).nullable(),
    })
    .nullable(),
  soknadsinfo: object().when(["behandlingstema", "hovedpart"], {
    is: (behandlingstema, hovedpart) => MKVUtils.erSoknad(behandlingstema) && hovedpart === BRUKER,
    then: soknadsinfo,
  }),
  oppgaveID: string()
    .siblingIs("journalpostID", (journalpostID) => !Utils._isEmpty(journalpostID), MANGLER_JOURNALPOST)
    .required(VELG_EN_OPPGAVE)
    .nullable(),
});

export default opprettnysak;
