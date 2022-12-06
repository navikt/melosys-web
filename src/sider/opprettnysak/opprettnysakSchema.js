import { object, string, boolean, array } from "yup";

import * as Utils from "../../utils";
import * as KV from "../../kodeverk";

import MKV from "../../melosyskodeverk";
import {
  skalViseSoknadsperiodeOgLand,
  skalViseSoknadsperiodeOgLandDeprecated,
} from "../journalforing/komponenter/opprettSak";

const {
  MAA_FYLLES_UT,
  SKRIV_INN_GYLDIG_FNR_ELLER_DNR,
  FANT_INGEN_NAVN_PA_FNR_ELLER_DNR,
  SKRIV_INN_GYLDIG_ORGNR,
  FANT_INGEN_NAVN_PA_ORGNR,
  VELG_MINST_ETT_LAND,
} = KV.Feilmeldinger;
const { BRUKER, VIRKSOMHET } = MKV.Koder.aktoersroller;

const VELG_SAKSTYPE = { melding: "Velg sakstype" };
const VELG_SAKSTEMA = { melding: "Velg sakstema" };
const VELG_BEHANDLINGSTYPE = { melding: "Velg behandlingstype" };
const VELG_BEHANDLINGSTEMA = { melding: "Velg behandlingstema" };
const VELG_OPPGAVE = { melding: "Velg hvilken oppgave du skal opprette sak på" };
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

// Fjernes med toggle melosys.behandle_alle_saker
const kreverPeriodeDeprecated = (saksnummer, hovedpart, sakstype, behandlingstema) =>
  skalOppretteNySak(saksnummer) && skalViseSoknadsperiodeOgLandDeprecated(hovedpart, sakstype, behandlingstema);

const kreverLand = (
  saksnummer,
  sakstype,
  sakstema,
  behandlingstema,
  behandlingstype,
  soknadslandUkjenteEllerAlleEosLand
) =>
  kreverPeriode(saksnummer, sakstype, sakstema, behandlingstema, behandlingstype) &&
  !soknadslandUkjenteEllerAlleEosLand;

// Fjernes med toggle melosys.behandle_alle_saker
const kreverLandDeprecated = (saksnummer, hovedpart, sakstype, behandlingstema, soknadslandUkjenteEllerAlleEosLand) =>
  kreverPeriodeDeprecated(hovedpart, sakstype, behandlingstema) && !soknadslandUkjenteEllerAlleEosLand;

const opprettnysak = object().shape({
  hovedpart: string().required(MAA_FYLLES_UT),
  brukerID: string()
    .when("hovedpart", {
      is: (hovedpart) => hovedpart === BRUKER,
      then: string().erFnrEllerDnr(SKRIV_INN_GYLDIG_FNR_ELLER_DNR).required(SKRIV_INN_GYLDIG_FNR_ELLER_DNR).nullable(),
    })
    .when(["hovedpart", "brukerNavn"], {
      is: (hovedpart, brukerNavn) => hovedpart === BRUKER && Utils._isEmpty(brukerNavn),
      then: string().harIkkeFnrEllerDnrLengde(FANT_INGEN_NAVN_PA_FNR_ELLER_DNR).nullable(),
    })
    .nullable(),
  brukerNavn: string().nullable(),
  virksomhetOrgnr: string()
    .when("hovedpart", {
      is: (hovedpart) => hovedpart === VIRKSOMHET,
      then: string().erOrgnr(SKRIV_INN_GYLDIG_ORGNR).required(SKRIV_INN_GYLDIG_ORGNR).nullable(),
    })
    .when(["hovedpart", "virksomhetNavn"], {
      is: (hovedpart, virksomhetNavn) => hovedpart === VIRKSOMHET && Utils._isEmpty(virksomhetNavn),
      then: string().harIkkeOrgnrLengde(FANT_INGEN_NAVN_PA_ORGNR).nullable(),
    })
    .nullable(),
  virksomhetNavn: string().nullable(),
  saksnummer: string()
    .nullable()
    .when("behandleAlleSakerToggleEnabled", {
      is: true,
      then: string().test(
        "må settes når du knytter til eksisterende sak",
        VELG_HVILKEN_SAK_DU_ONSKER_A_KNYTTE_BEHANDLINGEN_TIL,
        (saksnummer) => skalOppretteNySak(saksnummer) || !Utils._isEmpty(saksnummer)
      ),
    }),
  sakstype: string()
    .when("saksnummer", {
      is: skalOppretteNySak,
      then: string().required(VELG_SAKSTYPE).nullable(),
    })
    .nullable(),
  sakstema: string()
    .nullable()
    .when("behandleAlleSakerToggleEnabled", {
      is: true,
      then: string()
        .when("saksnummer", {
          is: skalOppretteNySak,
          then: string().required(VELG_SAKSTEMA).nullable(),
        })
        .nullable(),
    }),
  behandlingstema: string().required(VELG_BEHANDLINGSTEMA).nullable(),
  behandlingstype: string()
    .nullable()
    .when("behandleAlleSakerToggleEnabled", {
      is: true,
      then: string().required(VELG_BEHANDLINGSTYPE).nullable(),
    }),
  periodeFraOgMed: string()
    .nullable()
    .when("behandleAlleSakerToggleEnabled", {
      is: true,
      then: string()
        .nullable()
        .when(["saksnummer", "sakstype", "sakstema", "behandlingstema", "behandlingstype"], {
          is: kreverPeriode,
          then: string().required(MAA_FYLLES_UT).erGyldigDato().nullable(),
        }),
      otherwise: string()
        .nullable()
        .when(["saksnummer", "hovedpart", "sakstype", "behandlingstema"], {
          is: kreverPeriodeDeprecated,
          then: string().required(MAA_FYLLES_UT).erGyldigDato().nullable(),
        }),
    }),
  periodeTilOgMed: string()
    .nullable()
    .when("behandleAlleSakerToggleEnabled", {
      is: true,
      then: string()
        .nullable()
        .when(["saksnummer", "sakstype", "sakstema", "behandlingstema", "behandlingstype"], {
          is: (saksnummer, sakstype, sakstema, behandlingstema, behandlingstype) =>
            skalOppretteNySak(saksnummer) &&
            skalViseSoknadsperiodeOgLand(sakstype, sakstema, behandlingstema, behandlingstype),
          then: string().erEtterDatofelt("periodeFraOgMed").erGyldigDato().required(MAA_FYLLES_UT).nullable(),
        }),
      otherwise: string()
        .nullable()
        .when(["saksnummer", "hovedpart", "sakstype", "behandlingstema"], {
          is: (saksnummer, hovedpart, sakstype, behandlingstema) =>
            skalOppretteNySak(saksnummer) && skalViseSoknadsperiodeOgLandDeprecated(sakstype, behandlingstema),
          then: string().erEtterDatofelt("periodeFraOgMed").erGyldigDato().required(MAA_FYLLES_UT).nullable(),
        }),
    }),
  soknadslandUkjenteEllerAlleEosLand: boolean().nullable(),
  soknadsland: array().when("$behandleAlleSakerToggleEnabled", {
    is: true,
    then: array()
      .of(string())
      .ensure()
      .when(
        [
          "saksnummer",
          "sakstype",
          "sakstema",
          "behandlingstema",
          "behandlingstype",
          "soknadslandUkjenteEllerAlleEosLand",
        ],
        {
          is: kreverLand,
          then: array().of(string()).min(1, { _error: VELG_MINST_ETT_LAND }),
        }
      ),
    otherwise: array()
      .of(string())
      .ensure()
      .when(["saksnummer", "hovedpart", "sakstype", "behandlingstema", "soknadslandUkjenteEllerAlleEosLand"], {
        is: kreverLandDeprecated(),
        then: array().of(string()).min(1, { _error: VELG_MINST_ETT_LAND }),
      }),
  }),
  oppgaveID: string()
    .nullable()
    .when("behandleAlleSakerToggleEnabled", {
      is: true,
      then: string()
        .when("oppretterOppgave", {
          is: false,
          then: string().required(VELG_OPPGAVE).nullable(),
        })
        .nullable(),
    }),
  mottaksdato: string()
    .nullable()
    .when("behandleAlleSakerToggleEnabled", {
      is: true,
      then: string()
        .when("oppretterOppgave", {
          is: true,
          then: string().erGyldigDato().required(FYLL_UT_MOTTAKSDATO).nullable(),
        })
        .nullable(),
    }),
  behandlingsaarsakType: string()
    .nullable()
    .when("behandleAlleSakerToggleEnabled", {
      is: true,
      then: string()
        .when("oppretterOppgave", {
          is: true,
          then: string().required(VELG_BEHANDLINGSAARSAK).nullable(),
        })
        .nullable(),
    }),
  behandlingsaarsakFritekst: string()
    .nullable()
    .when(["behandlingsaarsakType", "oppretterOppgave"], {
      is: (behandlingsaarsakType, oppretterOppgave) =>
        Boolean(oppretterOppgave) && behandlingsaarsakType === MKV.Koder.behandlinger.behandlingsaarsaktyper.FRITEKST,
      then: string().max(25, MAX_25_TEGN).required(VELG_BEHANDLINGSAARSAK).nullable(),
    }),
  kanOppretteAndregangsbehandling: boolean()
    .nullable()
    .when("saksnummer", {
      is: (saksnummer) => !skalOppretteNySak(saksnummer) && !Utils._isEmpty(saksnummer),
      then: boolean().nullable().oneOf([true], DU_KAN_IKKE_OPPRETTE),
    }),
  behandleAlleSakerToggleEnabled: boolean(),
  oppretterOppgave: boolean(),
});

export default opprettnysak;
