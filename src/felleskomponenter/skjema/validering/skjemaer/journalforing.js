import * as MKV from 'melosys-kodeverk';
import * as Utils from '../../../../utils';
import * as Konstanter from '../../../../constants';
import * as KV from '../../../../kodeverk';

const {
  object, string, lazy, array,
} = Utils.yup;

const SKRIV_INN_FNR_ELLER_DNR = { melding: 'Skriv inn fnr eller dnr.' };
const SKRIV_INN_KUN_NUMMER = { melding: 'Skriv inn kun nummer.' };
const SKRIV_INN_GYLDIG_FNR_ELLER_DNR = { melding: 'Skriv inn gyldig fnr eller dnr.' };
const FANT_INGEN_NAVN_PA_ORGNR = { melding: 'Fant ingen navn på dette organisasjonsnummeret.' };
const FANT_INGEN_NAVN_PA_FNR_ELLER_DNR = { melding: 'Fant ingen navn på dette fnr eller dnr.' };
const SKRIV_INN_NAVN_PA_AVSENDER = { melding: 'Skriv inn navn på avsender' };
const SKRIV_INN_GYLDIG_ORGNR = { melding: 'Skriv inn gyldig orgnr.' };
const VELG_DOKUMENTTITTEL_FRA_LISTEN_ELLER_SKRIV_DIN_EGEN = { melding: 'Velg dokumenttittel fra listen eller skriv din egen.' };
const VELG_HVILKEN_SAK_DU_ONSKER_A_KNYTTE_JOURNALFORINGEN_MOT = { melding: 'Velg hvilken sak du ønsker å knytte journalføringen mot.' };
const SKRIV_INN_EN_GYLDIG_DATO = { melding: 'Skriv inn en gyldig dato' };
const TAST_INN_DATO = { melding: 'Tast inn dato' };
const VELG_MINST_ETT_LAND = { melding: 'Velg minst ett land.' };
const VELG_ETT_LAND = { melding: 'Velg ett land.' };
const VELG_EN_AVSENDER = { melding: 'Velg en avsender' };
const VELG_EN_BESTEMMELSE = 'Velg en bestemmelse.';

const anmodningOmUnntak = (journalforingHensikt, behandlingstype) =>
  journalforingHensikt === Konstanter.JOURNALFORING_HENSIKT.OPPRETT &&
  behandlingstype === MKV.Koder.behandlinger.behandlingstyper.ANMODNING_OM_UNNTAK_HOVEDREGEL;

const journalforing = object().shape({
  brukerID: string()
    .ensure()
    .erIkkeBlank(SKRIV_INN_FNR_ELLER_DNR)
    .erNummer(SKRIV_INN_KUN_NUMMER)
    .erFnrEllerDnr(SKRIV_INN_GYLDIG_FNR_ELLER_DNR)
    .when('$brukerNavn', {
      is: '',
      then: string()
        .harIkkeOrgnrLengde(FANT_INGEN_NAVN_PA_ORGNR)
        .harIkkeFnrEllerDnrLengde(FANT_INGEN_NAVN_PA_FNR_ELLER_DNR),
    }),
  avsenderID: string()
    .when('avsenderType', {
      is: KV.Koder.Avsendere.ARBEIDSGIVER_ELLER_FULLMEKTIG,
      then: string().nullable()
        .erNummer(SKRIV_INN_KUN_NUMMER)
        .erOrgnr(SKRIV_INN_GYLDIG_ORGNR)
        .when('avsenderNavn', {
          is: '',
          then: string()
            .harIkkeOrgnrLengde(FANT_INGEN_NAVN_PA_ORGNR),
        }),
    }),
  avsenderNavn: string()
    .required(SKRIV_INN_NAVN_PA_AVSENDER),
  hoveddokumentTittel: string()
    .required(VELG_DOKUMENTTITTEL_FRA_LISTEN_ELLER_SKRIV_DIN_EGEN),
  representantID: lazy(value => (value === '' ?
    string()
    :
    string()
      .erOrgnr(SKRIV_INN_GYLDIG_ORGNR)
      .when('representantNavn', {
        is: '',
        then: string()
          .harIkkeOrgnrLengde(FANT_INGEN_NAVN_PA_ORGNR)
          .harIkkeFnrEllerDnrLengde(FANT_INGEN_NAVN_PA_FNR_ELLER_DNR),
      })
  )),
  saksnummer: string()
    .when('journalforingHensikt', {
      is: Konstanter.JOURNALFORING_HENSIKT.KNYTT,
      then: string()
        .required(VELG_HVILKEN_SAK_DU_ONSKER_A_KNYTTE_JOURNALFORINGEN_MOT),
    }),
  journalforingPeriodeFraOgMed: string()
    .when('journalforingHensikt', {
      is: Konstanter.JOURNALFORING_HENSIKT.OPPRETT,
      then: string()
        .required(TAST_INN_DATO)
        .erGyldigDato(SKRIV_INN_EN_GYLDIG_DATO),
    }),
  journalforingPeriodeTilOgMed: string()
    .when('journalforingHensikt', {
      is: Konstanter.JOURNALFORING_HENSIKT.OPPRETT,
      then: string()
        .required(TAST_INN_DATO)
        .erGyldigDato(SKRIV_INN_EN_GYLDIG_DATO),
    }),
  journalforingSoknadsland: array().of(string())
    .ensure()
    .when('journalforingHensikt', {
      is: Konstanter.JOURNALFORING_HENSIKT.OPPRETT,
      then: array().of(string())
        .min(1, { _error: VELG_MINST_ETT_LAND }),
    }),
  journalforingUnntakFraLovvalgsland: string()
    .when(['journalforingHensikt', 'opprettnysak_behandlingstype'], {
      is: anmodningOmUnntak,
      then: string().required({ _error: VELG_ETT_LAND }),
    }),
  journalforingLovvalgsbestemmelse: string()
    .when(['journalforingHensikt', 'opprettnysak_behandlingstype'], {
      is: anmodningOmUnntak,
      then: string().required(VELG_EN_BESTEMMELSE),
    }),
  journalforingUnntakFraLovvalgsbestemmelse: string()
    .when(['journalforingHensikt', 'opprettnysak_behandlingstype'], {
      is: anmodningOmUnntak,
      then: string().required(VELG_EN_BESTEMMELSE),
    }),
  utenlandskTrygdemyndighetLandkode: string()
    .when('avsenderType', {
      is: KV.Koder.Avsendere.UTENLANDSK_TRYGDEMYNDIGHET,
      then: string().required(VELG_ETT_LAND),
    }),
  avsenderType: string()
    .when('$skalValidereAvsenderType', {
      is: true,
      then: string().required(VELG_EN_AVSENDER),
    }),

  /* Følgene felter viser ingen feilmeldinger til bruker, men må være en del av skjemaet for å kunne benytte .when() for andre felter. */
  journalforingHensikt: string(),
  representantNavn: string(),
  opprettnysak_behandlingstype: string(),
});

export { journalforing };
