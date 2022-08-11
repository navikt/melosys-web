import { object, string, lazy, array, boolean } from "yup";

import MKV from "../../../melosyskodeverk";
import * as Utils from "../../../utils";
import * as Konstanter from "../../../constants";
import * as KV from "../../../kodeverk";

const SKRIV_INN_KUN_NUMMER = { melding: "Skriv inn kun nummer." };
const SKRIV_INN_GYLDIG_FNR_ELLER_DNR = { melding: "Skriv inn gyldig fnr eller dnr." };
const FANT_INGEN_NAVN_PA_ORGNR = { melding: "Fant ingen navn på dette organisasjonsnummeret." };
const FANT_INGEN_NAVN_PA_FNR_ELLER_DNR = { melding: "Fant ingen navn på dette fnr eller dnr." };
const FANT_INGEN_NAVN_PA_ORGNR_FNR_ELLER_DNR = { melding: "Fant ingen navn på oppgitt org.nr., f.nr. eller d-nr." };
const SKRIV_INN_NAVN_PA_AVSENDER = { melding: "Skriv inn navn på avsender" };
const SKRIV_INN_GYLDIG_ORGNR = { melding: "Skriv inn gyldig orgnr." };
const SKRIV_INN_GYLDIG_ORGNR_FNR_DNR = { melding: "Du må skrive et gyldig org.nr. eller f.nr./d-nr." };
const VELG_DOKUMENTTITTEL_FRA_LISTEN_ELLER_SKRIV_DIN_EGEN = {
  melding: "Velg dokumenttittel fra listen eller skriv din egen.",
};
const VELG_HVILKEN_SAK_DU_ONSKER_A_KNYTTE_JOURNALFORINGEN_MOT = {
  melding: "Velg hvilken sak du ønsker å knytte journalføringen mot.",
};
const VELG_MINST_ETT_LAND = { melding: "Velg minst ett land." };
const VELG_ETT_LAND = { melding: "Velg ett land." };
const VELG_EN_AVSENDER = { melding: "Velg en avsender" };
const VELG_REPRESENTERER = { melding: "Velg hvem fullmektig representerer" };
const { MAA_FYLLES_UT } = KV.Feilmeldinger;
const { BRUKER, VIRKSOMHET } = MKV.Koder.aktoersroller;

const kreverPeriode = (journalforingHensikt, behandlingstema) =>
  journalforingHensikt === Konstanter.JOURNALFORING_HENSIKT.OPPRETT &&
  ![
    MKV.Koder.behandlinger.behandlingstema.ØVRIGE_SED_MED,
    MKV.Koder.behandlinger.behandlingstema.ØVRIGE_SED_UFM,
    MKV.Koder.behandlinger.behandlingstema.TRYGDETID,
    MKV.Koder.behandlinger.behandlingstema.ARBEID_I_UTLANDET,
    MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV,
  ].includes(behandlingstema);

const kreverLand = (journalforingHensikt, behandlingstema, ukjentEllerAlleEosLand) =>
  !ukjentEllerAlleEosLand && kreverPeriode(journalforingHensikt, behandlingstema);

const arbeidsgiverOgIkkePreutfyltAvsender = (avsenderType, erAvsenderPreutfylt) => {
  return avsenderType === KV.AvsenderTyper.ARBEIDSGIVER && !erAvsenderPreutfylt;
};

const fullmektigOgIkkePreutfyltAvsender = (avsenderType, erAvsenderPreutfylt) => {
  return avsenderType === KV.AvsenderTyper.FULLMEKTIG && !erAvsenderPreutfylt;
};

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
    .when("journalforingGjelder", {
      is: erVirksomhet,
      then: string().required().erOrgnr(SKRIV_INN_GYLDIG_ORGNR).nullable(),
    })
    .nullable(),
  avsenderNavn: string().required(SKRIV_INN_NAVN_PA_AVSENDER).nullable(),
  hoveddokument: object().shape({
    tittel: string().required(VELG_DOKUMENTTITTEL_FRA_LISTEN_ELLER_SKRIV_DIN_EGEN),
  }),
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
      hensikt === Konstanter.JOURNALFORING_HENSIKT.KNYTT || hensikt === Konstanter.JOURNALFORING_HENSIKT.NY_VURDERING,
    then: string().required(VELG_HVILKEN_SAK_DU_ONSKER_A_KNYTTE_JOURNALFORINGEN_MOT),
  }),
  journalforingPeriodeFraOgMed: string().when(["journalforingHensikt", "opprettnysak_behandlingstema"], {
    is: kreverPeriode,
    then: string().erGyldigDato().required(MAA_FYLLES_UT),
  }),
  journalforingPeriodeTilOgMed: lazy((value) =>
    !value
      ? string().ensure()
      : string().when(["journalforingHensikt", "opprettnysak_behandlingstema"], {
          is: kreverPeriode,
          then: string().erEtterDatofelt("journalforingPeriodeFraOgMed").erGyldigDato().required(MAA_FYLLES_UT),
        })
  ),
  journalforingSoknadsland: array()
    .of(string())
    .ensure()
    .when(["journalforingHensikt", "opprettnysak_behandlingstema", "journalforingSoknadslandUkjenteEllerAlleEosLand"], {
      is: kreverLand,
      then: array().of(string()).min(1, { _error: VELG_MINST_ETT_LAND }),
    }),
  utenlandskTrygdemyndighetLandkode: string().when("avsenderType", {
    is: MKV.Koder.avsendertyper.UTENLANDSK_TRYGDEMYNDIGHET,
    then: string().required(VELG_ETT_LAND),
  }),
  representantRepresenterer: string()
    .when("avsenderType", {
      is: KV.AvsenderTyper.FULLMEKTIG,
      then: string().required(VELG_REPRESENTERER).nullable(),
    })
    .nullable(),
  avsenderType: string().when("$erAvsenderPreutfylt", {
    is: false,
    then: string().ensure().required(VELG_EN_AVSENDER),
  }),
  mottattDato: string().erGyldigDato().required(MAA_FYLLES_UT),
  sakstype: string().required(MAA_FYLLES_UT).nullable(),
  sakstema: string()
    .nullable()
    .when("$visSakstema", {
      is: true,
      then: string().required(MAA_FYLLES_UT).nullable(),
    }),
  opprettnysak_behandlingstema: string()
    .nullable()
    .when("journalforingHensikt", {
      is: (hensikt) => hensikt === Konstanter.JOURNALFORING_HENSIKT.OPPRETT,
      then: string().required(MAA_FYLLES_UT).nullable(),
    }),
  opprettnysak_behandlingstype: string()
    .nullable()
    .when(["$visSakstema", "journalforingHensikt"], {
      is: (visSakstema, hensikt) => visSakstema && hensikt === Konstanter.JOURNALFORING_HENSIKT.OPPRETT,
      then: string().required(MAA_FYLLES_UT).nullable(),
    }),

  /* Følgene felter viser ingen feilmeldinger til bruker, men må være en del av skjemaet for å kunne benytte .when() for andre felter. */
  journalforingHensikt: string(),
  representantNavn: string().nullable(),
  journalforingSoknadslandUkjenteEllerAlleEosLand: boolean(),
});

export default journalforing;
