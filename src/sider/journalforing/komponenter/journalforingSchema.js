import { object, string, lazy, array, boolean } from "yup";

import MKV from "../../../melosyskodeverk";
import * as Konstanter from "../../../constants";
import * as KV from "../../../kodeverk";

const SKRIV_INN_FNR_ELLER_DNR = { melding: "Skriv inn fnr eller dnr." };
const SKRIV_INN_KUN_NUMMER = { melding: "Skriv inn kun nummer." };
const SKRIV_INN_GYLDIG_FNR_ELLER_DNR = { melding: "Skriv inn gyldig fnr eller dnr." };
const FANT_INGEN_NAVN_PA_ORGNR = { melding: "Fant ingen navn på dette organisasjonsnummeret." };
const FANT_INGEN_NAVN_PA_FNR_ELLER_DNR = { melding: "Fant ingen navn på dette fnr eller dnr." };
const SKRIV_INN_NAVN_PA_AVSENDER = { melding: "Skriv inn navn på avsender" };
const SKRIV_INN_GYLDIG_ORGNR = { melding: "Skriv inn gyldig orgnr." };
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

const organisasjonOgIkkePreutfyltAvsender = (avsenderType, erAvsenderPreutfylt) => {
  const organisasjonAliasTyper = [
    KV.AvsenderTyper.FULLMEKTIG,
    KV.AvsenderTyper.ARBEIDSGIVER,
    KV.AvsenderTyper.ARBEIDSGIVER_FULLMEKTIG,
  ];
  return organisasjonAliasTyper.includes(avsenderType) && !erAvsenderPreutfylt;
};

const journalforing = object().shape({
  brukerID: string()
    .ensure()
    .erIkkeBlank(SKRIV_INN_FNR_ELLER_DNR)
    .erNummer(SKRIV_INN_KUN_NUMMER)
    .erFnrEllerDnr(SKRIV_INN_GYLDIG_FNR_ELLER_DNR)
    .when("$brukerNavn", {
      is: "",
      then: string()
        .harIkkeOrgnrLengde(FANT_INGEN_NAVN_PA_ORGNR)
        .harIkkeFnrEllerDnrLengde(FANT_INGEN_NAVN_PA_FNR_ELLER_DNR),
    }),
  avsenderID: string().when(["avsenderType", "$erAvsenderPreutfylt"], {
    is: organisasjonOgIkkePreutfyltAvsender,
    then: string()
      .nullable()
      .erNummer(SKRIV_INN_KUN_NUMMER)
      .erOrgnr(SKRIV_INN_GYLDIG_ORGNR)
      .when("avsenderNavn", {
        is: "",
        then: string().harIkkeOrgnrLengde(FANT_INGEN_NAVN_PA_ORGNR),
      }),
  }),
  avsenderNavn: string().required(SKRIV_INN_NAVN_PA_AVSENDER),
  hoveddokument: object().shape({
    tittel: string().required(VELG_DOKUMENTTITTEL_FRA_LISTEN_ELLER_SKRIV_DIN_EGEN),
  }),
  representantID: lazy((value) =>
    value === ""
      ? string()
      : string()
          .erOrgnr(SKRIV_INN_GYLDIG_ORGNR)
          .when("representantNavn", {
            is: "",
            then: string()
              .harIkkeOrgnrLengde(FANT_INGEN_NAVN_PA_ORGNR)
              .harIkkeFnrEllerDnrLengde(FANT_INGEN_NAVN_PA_FNR_ELLER_DNR),
          })
  ),
  saksnummer: string().when("journalforingHensikt", {
    is: Konstanter.JOURNALFORING_HENSIKT.KNYTT,
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
  representantRepresenterer: string().when("avsenderType", {
    is: KV.AvsenderTyper.FULLMEKTIG,
    then: string().required(VELG_REPRESENTERER),
  }),
  avsenderType: string().when("$erAvsenderPreutfylt", {
    is: false,
    then: string().ensure().required(VELG_EN_AVSENDER),
  }),
  mottattDato: string().erGyldigDato().required(MAA_FYLLES_UT),

  /* Følgene felter viser ingen feilmeldinger til bruker, men må være en del av skjemaet for å kunne benytte .when() for andre felter. */
  journalforingHensikt: string(),
  representantNavn: string(),
  opprettnysak_behandlingstema: string(),
  journalforingSoknadslandUkjenteEllerAlleEosLand: boolean(),
});

export default journalforing;
