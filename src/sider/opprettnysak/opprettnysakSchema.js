/* eslint-disable @typescript-eslint/no-unused-vars */
// TODO: fjern eslint-disable når toggle melosys.behandle_alle_saker fjernes
import { object, string, mixed, array, lazy, boolean } from "yup";

import * as Utils from "../../utils";
import * as KV from "../../kodeverk";

import MKV from "../../melosyskodeverk";
import * as Konstanter from "../../constants";
import { skalViseSoknadsperiodeOgLand } from "../journalforing/komponenter/opprettSak";

const SKRIV_INN_FNR_ELLER_DNR = { melding: "Skriv inn f.nr eller d.nr" };
const SKRIV_INN_GYLDIG_FNR_ELLER_DNR = { melding: "Skriv inn gyldig f.nr eller d.nr" };
const FANT_INGEN_NAVN_PA_FNR_ELLER_DNR = { melding: "Fant ingen navn på dette f.nr eller d.nr." };
const SKRIV_INN_ORGNR = { melding: "Skriv inn organisasjonsnummer" };
const SKRIV_INN_GYLDIG_ORGNR = { melding: "Skriv inn gyldig organisasjonsnummer" };
const FANT_INGEN_NAVN_PA_ORGNR = { melding: "Fant ingen navn på dette organisasjonsnummeret." };
const VELG_SAKSTYPE = { melding: "Velg sakstype" };
// TODO: Legg denne på når toggle melosys.behandle_alle_saker er på. Da skal sakstema og behandlingstype bli required
// const VELG_SAKSTEMA = { melding: "Velg sakstema" };
// const VELG_BEHANDLINGSTYPE = { melding: "Velg behandlingstype" };
const VELG_BEHANDLINGSTEMA = { melding: "Velg behandlingstema" };
const { MAA_FYLLES_UT } = KV.Feilmeldinger;
const { BRUKER, VIRKSOMHET } = MKV.Koder.aktoersroller;
const VELG_MINST_ETT_LAND = { melding: "Velg minst ett land." };

// Trengs når toggle melosys.behandle_alle_saker fjernes
// const soknadsinfo = object().shape({
//   fom: string().erGyldigDato().required(MAA_FYLLES_UT),
//   tom: lazy((value) =>
//     !value ? string().ensure() : string().erGyldigDato().erEtterDatofelt("fom").required(MAA_FYLLES_UT)
//   ),
//   landkoder: array()
//     .of(string())
//     .when("erUkjenteEllerAlleEosLand", {
//       is: false,
//       then: array().of(string()).min(1, { _error: VELG_LAND }),
//     }),
//   erUkjenteEllerAlleEosLand: boolean(),
// });
const kreverPeriode = (journalforingHensikt, hovedpart, sakstype, behandlingstema) =>
  journalforingHensikt === Konstanter.JOURNALFORING_HENSIKT.OPPRETT &&
  skalViseSoknadsperiodeOgLand(hovedpart, sakstype, behandlingstema);

const kreverLand = (journalforingHensikt, hovedpart, sakstype, behandlingstema, ukjentEllerAlleEosLand) =>
  !ukjentEllerAlleEosLand && kreverPeriode(journalforingHensikt, hovedpart, sakstype, behandlingstema);

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
  // TODO: skru på validering når toggle melosys.behandle_alle_saker fjernes
  // soknadsinfo: object().when(["sakstype", "behandlingstema", "behandlingstype"], {
  //   is: (sakstype, behandlingstema, behandlingstype) =>
  //     skalViseSoknadsperiodeOgLand(sakstype, behandlingstema, behandlingstype),
  //   then: soknadsinfo,
  // }),
  oppgaveID: string().nullable(),
  journalforingPeriodeFraOgMed: string().when(["hovedpart", "sakstype", "opprettnysak_behandlingstema"], {
    is: kreverPeriode,
    then: string().erGyldigDato().required(MAA_FYLLES_UT),
  }),
  journalforingPeriodeTilOgMed: lazy((value) =>
    !value
      ? string().ensure()
      : string().when(["hovedpart", "sakstype", "opprettnysak_behandlingstema"], {
          is: kreverPeriode,
          then: string().erEtterDatofelt("journalforingPeriodeFraOgMed").erGyldigDato().required(MAA_FYLLES_UT),
        })
  ),
  journalforingSoknadslandUkjenteEllerAlleEosLand: boolean(),
  journalforingSoknadsland: array()
    .of(string())
    .ensure()
    .when(["sakstype", "opprettnysak_behandlingstema", "journalforingSoknadslandUkjenteEllerAlleEosLand"], {
      is: kreverLand,
      then: array().of(string()).min(1, { _error: VELG_MINST_ETT_LAND }),
    }),
  journalforingHensikt: string(),
});

export default opprettnysak;
