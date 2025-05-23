import { array, boolean, object, string } from "yup";

import MKV from "../../../melosyskodeverk";
import * as Utils from "../../../utils";
import * as Konstanter from "../../../constants";
import * as KV from "../../../kodeverk";
import { skalViseSoknadsperiodeOgLand } from "./opprettSak";

const {
  MAA_FYLLES_UT,
  SKRIV_INN_GYLDIG_ORGNR_FNR_DNR,
  SKRIV_INN_GYLDIG_FNR_ELLER_DNR,
  FANT_INGEN_NAVN_PA_FNR_ELLER_DNR,
  SKRIV_INN_GYLDIG_ORGNR,
  FANT_INGEN_NAVN_PA_ORGNR,
  VELG_MINST_ETT_LAND,
  VELG_MINST_TO_LAND,
  SKRIV_INN_KUN_NUMMER,
} = KV.Feilmeldinger;
const { BRUKER, VIRKSOMHET } = MKV.Koder.aktoersroller;

const FINNER_IKKE_NAVN_PA_AVSENDER = { melding: "Finner ikke navn på avsender" };
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
const OPPGI_AVSENDER = { melding: "Oppgi avsender" };

const lagMelding = (felt) => ({ melding: `${felt} må fylles ut` });

const kreverPeriode = (journalforingHensikt, sakstype, sakstema, behandlingstema, behandlingstype) =>
  journalforingHensikt === Konstanter.JOURNALFORING_HENSIKT.OPPRETT &&
  skalViseSoknadsperiodeOgLand(sakstype, sakstema, behandlingstema, behandlingstype);

const kreverLand = (
  journalforingHensikt,
  sakstype,
  sakstema,
  behandlingstema,
  behandlingstype,
  flereLandUkjentHvilke,
) =>
  !flereLandUkjentHvilke && kreverPeriode(journalforingHensikt, sakstype, sakstema, behandlingstema, behandlingstype);

const annenPersonEllerVirksomhetOgIkkePreutfyltAvsender = (avsenderType, erAvsenderPreutfylt) => {
  return avsenderType === KV.AvsenderTyper.ANNEN_PERSON_ELLER_VIRKSOMHET && !erAvsenderPreutfylt;
};

const erFritekst = (avsenderType) => avsenderType === KV.AvsenderTyper.FRITEKST;

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
      then: (schema) => schema.test(erIkkeUnderRedigering(DU_MA_LAGRE_TITTEL_HOVEDDOKUMENT)),
    }),
  logiskeVedlegg: array().of(
    string()
      .required(VELG_DOKUMENTTITTEL_FRA_LISTEN_ELLER_SKRIV_DIN_EGEN)
      .when("$journalforingKnappErTryktPå", {
        is: true,
        then: (schema) => schema.test(erIkkeUnderRedigering(DU_MA_LAGRE_TITTEL_VEDLEGG)),
      }),
  ),
});

const erBruker = (journalforingGjelder) => journalforingGjelder === BRUKER;
const erVirksomhet = (journalforingGjelder) => journalforingGjelder === VIRKSOMHET;

const journalforing = object().shape({
  journalforingGjelder: string().required(MAA_FYLLES_UT),
  brukerID: string()
    .when("journalforingGjelder", {
      is: erBruker,
      then: (schema) =>
        schema.erFnrEllerDnr(SKRIV_INN_GYLDIG_FNR_ELLER_DNR).required(SKRIV_INN_GYLDIG_FNR_ELLER_DNR).nullable(),
    })
    .when(["journalforingGjelder", "brukerNavn"], {
      is: (journalforingGjelder, navn) => erBruker(journalforingGjelder) && Utils._isEmpty(navn),
      then: (schema) => schema.harIkkeFnrEllerDnrLengde(FANT_INGEN_NAVN_PA_FNR_ELLER_DNR).nullable(),
    })
    .nullable(),
  brukerNavn: string().nullable(),
  virksomhetOrgnr: string()
    .when("journalforingGjelder", {
      is: erVirksomhet,
      then: (schema) => schema.erOrgnr(SKRIV_INN_GYLDIG_ORGNR).required(SKRIV_INN_GYLDIG_ORGNR).nullable(),
    })
    .when(["journalforingGjelder", "virksomhetNavn"], {
      is: (journalforingGjelder, navn) => erVirksomhet(journalforingGjelder) && Utils._isEmpty(navn),
      then: (schema) => schema.harIkkeOrgnrLengde(FANT_INGEN_NAVN_PA_ORGNR).nullable(),
    })
    .nullable(),
  virksomhetNavn: string().nullable(),

  avsenderID: string()
    .nullable()
    .when(["avsenderType", "$erAvsenderPreutfylt"], {
      is: annenPersonEllerVirksomhetOgIkkePreutfyltAvsender,
      then: (schema) =>
        schema
          .nullable()
          .erNummerTolerererEttMellomrom(SKRIV_INN_KUN_NUMMER)
          .erFnrEllerDnrEllerOrgnrTolererEttMellomrom(SKRIV_INN_GYLDIG_ORGNR_FNR_DNR)
          .when("avsenderNavn", {
            is: Utils._isEmpty,
            then: (schemaInner) =>
              schemaInner
                .harIkkeOrgnrFnrEllerDnrLengdeTolerererEttMellomrom(FANT_INGEN_NAVN_PA_ORGNR_FNR_ELLER_DNR)
                .nullable(),
          }),
    })
    .when(["journalforingGjelder", "avsenderType"], {
      is: (journalføringGjelder, avsenderType) => erVirksomhet(journalføringGjelder) && !erFritekst(avsenderType),
      then: (schema) => schema.required().erOrgnr(SKRIV_INN_GYLDIG_ORGNR).nullable(),
    })
    .nullable(),
  avsenderNavn: string()
    .nullable()
    .when("$mottaksKanalErEessi", {
      is: false,
      then: (schema) =>
        schema.when("avsenderType", {
          is: erFritekst,
          then: (schemaInner) => schemaInner.required(OPPGI_AVSENDER).nullable(),
          otherwise: (schemaInner) => schemaInner.required(FINNER_IKKE_NAVN_PA_AVSENDER).nullable(),
        }),
    }),
  avsenderType: string().when("$erAvsenderPreutfylt", {
    is: false,
    then: (schema) => schema.ensure().required(VELG_EN_AVSENDER),
  }),
  utenlandskTrygdemyndighetLandkode: string()
    .when(["avsenderType", "$mottaksKanalErEessi"], {
      is: (avsendertype, mottaksKanalErEessi) =>
        avsendertype === MKV.Koder.avsendertyper.UTENLANDSK_TRYGDEMYNDIGHET && !mottaksKanalErEessi,
      then: (schema) => schema.required(VELG_ETT_LAND_UTENLANDSK_TRYGDEMYNDIGHET).nullable(),
    })
    .nullable(),

  mottattDato: string().erGyldigDato().required(MAA_FYLLES_UT),

  saksnummer: string().when("journalforingHensikt", {
    is: (hensikt) =>
      hensikt === Konstanter.JOURNALFORING_HENSIKT.KNYTT ||
      hensikt === Konstanter.JOURNALFORING_HENSIKT.ANDREGANGSBEHANDLE,
    then: (schema) => schema.required(VELG_HVILKEN_SAK_DU_ONSKER_A_KNYTTE_JOURNALFORINGEN_MOT),
  }),
  sakstype: string()
    .nullable()
    .when("journalforingHensikt", {
      is: (hensikt) => hensikt === Konstanter.JOURNALFORING_HENSIKT.OPPRETT,
      then: (schema) => schema.required(lagMelding("Sakstype")).nullable(),
    }),
  sakstema: string()
    .nullable()
    .when("journalforingHensikt", {
      is: (hensikt) => hensikt === Konstanter.JOURNALFORING_HENSIKT.OPPRETT,
      then: (schema) => schema.required(lagMelding("Sakstema")).nullable(),
    }),
  opprettnysak_behandlingstema: string()
    .nullable()
    .when("journalforingHensikt", {
      is: (hensikt) => hensikt === Konstanter.JOURNALFORING_HENSIKT.OPPRETT,
      then: (schema) => schema.required(lagMelding("Behandlingstema")).nullable(),
    }),
  opprettnysak_behandlingstype: string()
    .nullable()
    .when("journalforingHensikt", {
      is: (hensikt) => hensikt === Konstanter.JOURNALFORING_HENSIKT.OPPRETT,
      then: (schema) => schema.required(lagMelding("Behandlingstype")).nullable(),
    }),
  behandlingstema: string()
    .nullable()
    .when(["journalforingHensikt", "opprettBehandling"], {
      is: (hensikt, opprettBehandling) =>
        (hensikt === Konstanter.JOURNALFORING_HENSIKT.KNYTT ||
          hensikt === Konstanter.JOURNALFORING_HENSIKT.ANDREGANGSBEHANDLE) &&
        opprettBehandling,
      then: (schema) => schema.required(lagMelding("Behandlingstema")).nullable(),
    }),
  behandlingstype: string()
    .nullable()
    .when(["journalforingHensikt", "opprettBehandling"], {
      is: (hensikt, opprettBehandling) =>
        (hensikt === Konstanter.JOURNALFORING_HENSIKT.KNYTT ||
          hensikt === Konstanter.JOURNALFORING_HENSIKT.ANDREGANGSBEHANDLE) &&
        opprettBehandling,
      then: (schema) => schema.required(lagMelding("Behandlingstype")).nullable(),
    }),
  journalforingPeriodeFraOgMed: string()
    .when(
      ["journalforingHensikt", "sakstype", "sakstema", "opprettnysak_behandlingstema", "opprettnysak_behandlingstype"],
      {
        is: kreverPeriode,
        then: (schema) => schema.erGyldigDato().required(MAA_FYLLES_UT).nullable(),
      },
    )
    .nullable(),
  journalforingPeriodeTilOgMed: string().nullable().erEtterDatofelt("journalforingPeriodeFraOgMed").erGyldigDato(),
  journalforingSoknadsland: array()
    .of(string())
    .ensure()
    .when(
      [
        "journalforingHensikt",
        "sakstype",
        "sakstema",
        "opprettnysak_behandlingstema",
        "opprettnysak_behandlingstype",
        "journalforingSoknadslandFlereLandUkjentHvilke",
      ],
      {
        is: kreverLand,
        then: (schema) =>
          schema.when("opprettnysak_behandlingstema", {
            is: MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND,
            then: (schemaInner) => schemaInner.min(2, { _error: VELG_MINST_TO_LAND }),
            otherwise: (schemaInner) => schemaInner.min(1, { _error: VELG_MINST_ETT_LAND }),
          }),
      },
    ),

  /* Følgene felter viser ingen feilmeldinger til bruker, men må være en del av skjemaet for å kunne benytte .when() for andre felter. */
  hoveddokument,
  journalforingHensikt: string(),
  journalforingSoknadslandFlereLandUkjentHvilke: boolean(),
  opprettBehandling: boolean().nullable(),
  flereLandUkjentHvilke: boolean().nullable(),
  land: array()
    .nullable()
    .when(
      [
        "journalforingHensikt",
        "sakstype",
        "sakstema",
        "opprettnysak_behandlingstema",
        "opprettnysak_behandlingstype",
        "flereLandUkjentHvilke",
      ],
      {
        is: kreverLand,
        then: (schema) =>
          schema
            .min(1, VELG_MINST_ETT_LAND)
            .when("$erSoknadOmFlereLand", {
              is: true,
              then: (schemaInner) => schemaInner.min(2, VELG_MINST_TO_LAND).nullable(),
            })
            .nullable(),
      },
    )
    .nullable(),
  soknadsperiodeFOM: string()
    .nullable()
    .when(
      ["journalforingHensikt", "sakstype", "sakstema", "opprettnysak_behandlingstema", "opprettnysak_behandlingstype"],
      {
        is: kreverPeriode,
        then: (schema) =>
          schema.erGyldigDato(KV.Feilmeldinger.ugyldigDato("F.o.m.")).required(MAA_FYLLES_UT).nullable(),
      },
    )
    .nullable(),
  soknadsperiodeTOM: string()
    .nullable()
    .when(
      ["journalforingHensikt", "sakstype", "sakstema", "opprettnysak_behandlingstema", "opprettnysak_behandlingstype"],
      {
        is: kreverPeriode,
        then: (schema) =>
          schema
            .erGyldigDato(KV.Feilmeldinger.ugyldigDato("T.o.m."))
            .required(MAA_FYLLES_UT)
            .erEtterDatofelt(KV.Feilmeldinger.tomDatoForFomDato, "soknadsperiodeFOM")
            .nullable(),
      },
    )
    .nullable(),

  vedlegg: array(hoveddokument).nullable(),
});

export default journalforing;
