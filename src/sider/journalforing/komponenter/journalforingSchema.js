import { object, string, lazy, array, boolean } from "yup";

import MKV from "../../../melosyskodeverk";
import * as Utils from "../../../utils";
import * as Konstanter from "../../../constants";
import * as KV from "../../../kodeverk";
import { skalViseSoknadsperiodeOgLand, skalViseSoknadsperiodeOgLandDeprecated } from "./opprettSak";

const {
  MAA_FYLLES_UT,
  SKRIV_INN_GYLDIG_FNR_ELLER_DNR,
  FANT_INGEN_NAVN_PA_FNR_ELLER_DNR,
  SKRIV_INN_GYLDIG_ORGNR,
  FANT_INGEN_NAVN_PA_ORGNR,
  VELG_MINST_ETT_LAND,
} = KV.Feilmeldinger;
const { BRUKER, VIRKSOMHET } = MKV.Koder.aktoersroller;

const SKRIV_INN_KUN_NUMMER = { melding: "Skriv inn kun nummer" };
const FINNER_IKKE_NAVN_PA_AVSENDER = { melding: "Finner ikke navn på avsender" };
const SKRIV_INN_GYLDIG_ORGNR_FNR_DNR = { melding: "Du må skrive et gyldig org.nr. eller f.nr./d-nr." };
const FANT_INGEN_NAVN_PA_ORGNR_FNR_ELLER_DNR = { melding: "Fant ingen navn på oppgitt org.nr., f.nr. eller d-nr." };
const VELG_DOKUMENTTITTEL_FRA_LISTEN_ELLER_SKRIV_DIN_EGEN = {
  melding: "Velg dokumenttittel fra listen eller skriv din egen",
};
const VELG_HVILKEN_SAK_DU_ONSKER_A_KNYTTE_JOURNALFORINGEN_MOT = {
  melding: "Velg hvilken sak du ønsker å knytte journalføringen mot",
};
const DU_MA_LAGRE_TITTEL_VEDLEGG = { melding: "Du må lagre tittel på vedlegg" };
const DU_MA_LAGRE_TITTEL_HOVEDDOKUMENT = { melding: "Du må lagre tittel på hoveddokument" };
const VELG_ETT_LAND_UTENLANDSK_TRYGDEMYNDIGHET = { melding: "Velg land til avsender: utenlandsk trygdemyndighet" };
const VELG_EN_AVSENDER = { melding: "Velg en avsender" };
const OPPGI_ANNEN_AVSENDER = { melding: "Oppgi avsender" };
const VELG_REPRESENTERER = { melding: "Velg hvem fullmektig representerer" };

const lagMelding = (felt) => ({ melding: `${felt} må fylles ut` });

const kreverPeriode = (journalforingHensikt, sakstype, sakstema, behandlingstema, behandlingstype) =>
  journalforingHensikt === Konstanter.JOURNALFORING_HENSIKT.OPPRETT &&
  skalViseSoknadsperiodeOgLand(sakstype, sakstema, behandlingstema, behandlingstype);

// Fjernes med toggle melosys.behandle_alle_saker
const kreverPeriodeDeprecated = (journalforingHensikt, hovedpart, sakstype, behandlingstema) =>
  journalforingHensikt === Konstanter.JOURNALFORING_HENSIKT.OPPRETT &&
  skalViseSoknadsperiodeOgLandDeprecated(hovedpart, sakstype, behandlingstema);

const kreverLand = (
  journalforingHensikt,
  sakstype,
  sakstema,
  behandlingstema,
  behandlingstype,
  ukjentEllerAlleEosLand
) =>
  !ukjentEllerAlleEosLand && kreverPeriode(journalforingHensikt, sakstype, sakstema, behandlingstema, behandlingstype);

// Fjernes med toggle melosys.behandle_alle_saker
const kreverLandDeprecated = (journalforingHensikt, hovedpart, sakstype, behandlingstema, ukjentEllerAlleEosLand) =>
  !ukjentEllerAlleEosLand && kreverPeriodeDeprecated(journalforingHensikt, hovedpart, sakstype, behandlingstema);

const arbeidsgiverOgIkkePreutfyltAvsender = (avsenderType, erAvsenderPreutfylt) => {
  return avsenderType === KV.AvsenderTyper.ARBEIDSGIVER && !erAvsenderPreutfylt;
};

const fullmektigOgIkkePreutfyltAvsender = (avsenderType, erAvsenderPreutfylt) => {
  return avsenderType === KV.AvsenderTyper.FULLMEKTIG && !erAvsenderPreutfylt;
};

const erAnnenAvsender = (avsenderType) => avsenderType === KV.AvsenderTyper.ANNEN;

const erIkkeUnderRedigering = (feilmelding) => ({
  name: "erIkkeUnderRedigering",
  message: feilmelding,
  test: (value, { options }) => options?.context?.registeredFields && !options.context.registeredFields[options.path],
});

const hoveddokument = object().shape({
  tittel: string()
    .required(VELG_DOKUMENTTITTEL_FRA_LISTEN_ELLER_SKRIV_DIN_EGEN)
    .when("$journalforingKnappErTryktPå", {
      is: true,
      then: string().test(erIkkeUnderRedigering(DU_MA_LAGRE_TITTEL_HOVEDDOKUMENT)),
    }),
  logiskeVedlegg: array().of(
    string()
      .required(VELG_DOKUMENTTITTEL_FRA_LISTEN_ELLER_SKRIV_DIN_EGEN)
      .when("$journalforingKnappErTryktPå", {
        is: true,
        then: string().test(erIkkeUnderRedigering(DU_MA_LAGRE_TITTEL_VEDLEGG)),
      })
  ),
});

const erBruker = (journalforingGjelder) => journalforingGjelder === BRUKER;
const erVirksomhet = (journalforingGjelder) => journalforingGjelder === VIRKSOMHET;

const journalforing = object().shape({
  journalforingGjelder: string().required(MAA_FYLLES_UT),
  brukerID: string()
    .when("journalforingGjelder", {
      is: erBruker,
      then: string().erFnrEllerDnr(SKRIV_INN_GYLDIG_FNR_ELLER_DNR).required(SKRIV_INN_GYLDIG_FNR_ELLER_DNR).nullable(),
    })
    .when(["journalforingGjelder", "brukerNavn"], {
      is: (journalforingGjelder, navn) => erBruker(journalforingGjelder) && Utils._isEmpty(navn),
      then: string().harIkkeFnrEllerDnrLengde(FANT_INGEN_NAVN_PA_FNR_ELLER_DNR).nullable(),
    })
    .nullable(),
  brukerNavn: string().nullable(),
  virksomhetOrgnr: string()
    .when("journalforingGjelder", {
      is: erVirksomhet,
      then: string().erOrgnr(SKRIV_INN_GYLDIG_ORGNR).required(SKRIV_INN_GYLDIG_ORGNR).nullable(),
    })
    .when(["journalforingGjelder", "virksomhetNavn"], {
      is: (journalforingGjelder, navn) => erVirksomhet(journalforingGjelder) && Utils._isEmpty(navn),
      then: string().harIkkeOrgnrLengde(FANT_INGEN_NAVN_PA_ORGNR).nullable(),
    })
    .nullable(),
  virksomhetNavn: string().nullable(),
  avsenderID: string()
    .nullable()
    .when(["avsenderType", "$erAvsenderPreutfylt"], {
      is: arbeidsgiverOgIkkePreutfyltAvsender,
      then: string()
        .nullable()
        .erNummer(SKRIV_INN_KUN_NUMMER)
        .erOrgnr(SKRIV_INN_GYLDIG_ORGNR)
        .when("avsenderNavn", {
          is: Utils._isEmpty,
          then: string().harIkkeOrgnrLengde(FANT_INGEN_NAVN_PA_ORGNR).nullable(),
        }),
    })
    .when(["avsenderType", "$erAvsenderPreutfylt"], {
      is: fullmektigOgIkkePreutfyltAvsender,
      then: string()
        .nullable()
        .erNummerTolerererEttMellomrom(SKRIV_INN_KUN_NUMMER)
        .erFnrEllerDnrEllerOrgnrTolererEttMellomrom(SKRIV_INN_GYLDIG_ORGNR_FNR_DNR)
        .when("avsenderNavn", {
          is: Utils._isEmpty,
          then: string()
            .harIkkeOrgnrFnrEllerDnrLengdeTolerererEttMellomrom(FANT_INGEN_NAVN_PA_ORGNR_FNR_ELLER_DNR)
            .nullable(),
        }),
    })
    .when(["journalforingGjelder", "avsenderType"], {
      is: (journalføringGjelder, avsenderType) => erVirksomhet(journalføringGjelder) && !erAnnenAvsender(avsenderType),
      then: string().required().erOrgnr(SKRIV_INN_GYLDIG_ORGNR).nullable(),
    })
    .nullable(),
  avsenderNavn: string().when("avsenderType", {
    is: erAnnenAvsender,
    then: string().required(OPPGI_ANNEN_AVSENDER).nullable(),
    otherwise: string().required(FINNER_IKKE_NAVN_PA_AVSENDER).nullable(),
  }),
  hoveddokument,
  representantID: lazy((value) =>
    Utils._isEmpty(value)
      ? string().nullable()
      : string()
          .erFnrEllerDnrEllerOrgnrTolererEttMellomrom(SKRIV_INN_GYLDIG_ORGNR_FNR_DNR)
          .when("representantNavn", {
            is: Utils._isEmpty,
            then: string()
              .harIkkeOrgnrLengde(FANT_INGEN_NAVN_PA_ORGNR)
              .harIkkeFnrEllerDnrLengde(FANT_INGEN_NAVN_PA_FNR_ELLER_DNR)
              .nullable(),
          })
          .nullable()
  ),
  saksnummer: string().when("journalforingHensikt", {
    is: (hensikt) =>
      hensikt === Konstanter.JOURNALFORING_HENSIKT.KNYTT ||
      hensikt === Konstanter.JOURNALFORING_HENSIKT.ANDREGANGSBEHANDLE,
    then: string().required(VELG_HVILKEN_SAK_DU_ONSKER_A_KNYTTE_JOURNALFORINGEN_MOT),
  }),
  journalforingPeriodeFraOgMed: string()
    .when("$behandleAlleSakerToggleEnabled", {
      is: (behandleAlleSakerToggleEnabled) => behandleAlleSakerToggleEnabled,
      then: string()
        .when(
          [
            "journalforingHensikt",
            "sakstype",
            "sakstema",
            "opprettnysak_behandlingstema",
            "opprettnysak_behandlingstype",
          ],
          {
            is: kreverPeriode,
            then: string().erGyldigDato().required(MAA_FYLLES_UT).nullable(),
          }
        )
        .nullable(),
      otherwise: string()
        .when(["journalforingHensikt", "journalforingGjelder", "sakstype", "opprettnysak_behandlingstema"], {
          is: kreverPeriodeDeprecated,
          then: string().erGyldigDato().required(MAA_FYLLES_UT).nullable(),
        })
        .nullable(),
    })
    .nullable(),
  journalforingPeriodeTilOgMed: lazy((value) =>
    !value
      ? string().ensure()
      : string().when("$behandleAlleSakerToggleEnabled", {
          is: (behandleAlleSakerToggleEnabled) => behandleAlleSakerToggleEnabled,
          then: string().when(
            ["journalforingHensikt", "sakstype", "opprettnysak_behandlingstema", "opprettnysak_behandlingstype"],
            {
              is: kreverPeriode,
              then: string().erGyldigDato().required(MAA_FYLLES_UT),
            }
          ),
          otherwise: string().when(
            ["journalforingHensikt", "journalforingGjelder", "sakstype", "opprettnysak_behandlingstema"],
            {
              is: kreverPeriodeDeprecated,
              then: string().erGyldigDato().required(MAA_FYLLES_UT),
            }
          ),
        })
  ),
  journalforingSoknadsland: array().when("$behandleAlleSakerToggleEnabled", {
    is: (behandleAlleSakerToggleEnabled) => behandleAlleSakerToggleEnabled,
    then: array()
      .of(string())
      .ensure()
      .when(
        [
          "journalforingHensikt",
          "sakstype",
          "sakstema",
          "opprettnysak_behandlingstema",
          "opprettnysak_behandlingstype",
          "journalforingSoknadslandUkjenteEllerAlleEosLand",
        ],
        {
          is: kreverLand,
          then: array().of(string()).min(1, { _error: VELG_MINST_ETT_LAND }),
        }
      ),
    otherwise: array()
      .of(string())
      .ensure()
      .when(
        [
          "journalforingHensikt",
          "journalforingGjelder",
          "sakstype",
          "opprettnysak_behandlingstema",
          "journalforingSoknadslandUkjenteEllerAlleEosLand",
        ],
        {
          is: kreverLandDeprecated,
          then: array().of(string()).min(1, { _error: VELG_MINST_ETT_LAND }),
        }
      ),
  }),
  utenlandskTrygdemyndighetLandkode: string()
    .when("avsenderType", {
      is: MKV.Koder.avsendertyper.UTENLANDSK_TRYGDEMYNDIGHET,
      then: string().required(VELG_ETT_LAND_UTENLANDSK_TRYGDEMYNDIGHET).nullable(),
    })
    .nullable(),
  representantRepresenterer: string()
    .when(["avsenderType", "representantNavn"], {
      is: (avsenderType, representantNavn) =>
        avsenderType === KV.AvsenderTyper.FULLMEKTIG && !Utils._isEmpty(representantNavn),
      then: string().required(VELG_REPRESENTERER).nullable(),
    })
    .nullable(),
  avsenderType: string().when("$erAvsenderPreutfylt", {
    is: false,
    then: string().ensure().required(VELG_EN_AVSENDER),
  }),
  mottattDato: string().erGyldigDato().required(MAA_FYLLES_UT),
  sakstype: string()
    .nullable()
    .when("journalforingHensikt", {
      is: (hensikt) => hensikt === Konstanter.JOURNALFORING_HENSIKT.OPPRETT,
      then: string().required(lagMelding("Sakstype")).nullable(),
    }),
  sakstema: string()
    .nullable()
    .when(["$behandleAlleSakerToggleEnabled", "journalforingHensikt"], {
      is: (behandleAlleSakerToggleEnabled, hensikt) =>
        behandleAlleSakerToggleEnabled && hensikt === Konstanter.JOURNALFORING_HENSIKT.OPPRETT,
      then: string().required(lagMelding("Sakstema")).nullable(),
    }),
  opprettnysak_behandlingstema: string()
    .nullable()
    .when("journalforingHensikt", {
      is: (hensikt) => hensikt === Konstanter.JOURNALFORING_HENSIKT.OPPRETT,
      then: string().required(lagMelding("Behandlingstema")).nullable(),
    }),
  opprettnysak_behandlingstype: string()
    .nullable()
    .when(["$behandleAlleSakerToggleEnabled", "journalforingHensikt"], {
      is: (behandleAlleSakerToggleEnabled, hensikt) =>
        behandleAlleSakerToggleEnabled && hensikt === Konstanter.JOURNALFORING_HENSIKT.OPPRETT,
      then: string().required(lagMelding("Behandlingstype")).nullable(),
    }),

  /* Følgene felter viser ingen feilmeldinger til bruker, men må være en del av skjemaet for å kunne benytte .when() for andre felter. */
  journalforingHensikt: string(),
  representantNavn: string().nullable(),
  journalforingSoknadslandUkjenteEllerAlleEosLand: boolean(),
});

export default journalforing;
