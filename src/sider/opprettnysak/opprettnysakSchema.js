import { object, string, mixed, array, lazy, boolean } from "yup";

import * as Utils from "../../utils";
import * as KV from "../../kodeverk";

import { Utils as MKVUtils } from "../../melosyskodeverk";

const SKRIV_INN_FNR_ELLER_DNR = { melding: "Skriv inn f.nr eller d.nr" };
const SKRIV_INN_KUN_NUMMER = { melding: "Skriv inn kun nummer." };
const SKRIV_INN_GYLDIG_FNR_ELLER_DNR = { melding: "Skriv inn gyldig f.nr eller d.nr" };
const FANT_INGEN_NAVN_PA_FNR_ELLER_DNR = { melding: "Fant ingen navn på dette f.nr eller d.nr." };
const VELG_SAKSTYPE = { melding: "Velg sakstype" };
const VELG_BEHANDLINGSTEMA = { melding: "Velg behandlingstema" };
const VELG_LAND = { melding: "Velg land" };
const VELG_EN_OPPGAVE = { melding: "Velg en oppgave" };
const MANGLER_JOURNALPOST = { melding: "Den valgte oppgaven har ingen journalpost" };
const { MAA_FYLLES_UT } = KV.Feilmeldinger;

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
  brukerID: string()
    .ensure()
    .erIkkeBlank(SKRIV_INN_FNR_ELLER_DNR)
    .erNummer(SKRIV_INN_KUN_NUMMER)
    .erFnrEllerDnr(SKRIV_INN_GYLDIG_FNR_ELLER_DNR)
    .when("bruker", {
      is: undefined,
      then: string().harIkkeFnrEllerDnrLengde(FANT_INGEN_NAVN_PA_FNR_ELLER_DNR),
    }),
  sakstype: string().required(VELG_SAKSTYPE),
  behandlingstema: string().required(VELG_BEHANDLINGSTEMA),
  soknadsinfo: object().when("behandlingstema", {
    is: MKVUtils.erSoknad,
    then: soknadsinfo,
  }),
  oppgaveID: string()
    .siblingIs("journalpostID", (journalpostID) => !Utils._isEmpty(journalpostID), MANGLER_JOURNALPOST)
    .required(VELG_EN_OPPGAVE),

  /* Følgene felter viser ingen feilmeldinger til bruker, men må være en del av skjemaet for å kunne benytte .when() for andre felter. */
  bruker: mixed(),
});

export default opprettnysak;
