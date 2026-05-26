import * as Anmodningsperioder from "./modules/anmodningsperioder";
import * as Adresser from "./modules/adresser";
import * as Avklartefakta from "./modules/avklartefakta";
import * as Behandlinger from "./modules/behandlinger";
import * as MottatteOpplysninger from "./modules/mottatteOpplysninger";
import * as Dokumenter from "./modules/dokumenter";
import * as DokumenterV2 from "./modules/dokumenter-v2";
import * as Eessi from "./modules/eessi";
import * as Fagsaker from "./modules/fagsaker";
import * as Faktureringskomponenten from "./modules/faktureringskomponenten";
import * as Featuretoggle from "./modules/featuretoggle";
import * as Ftrl from "./modules/ftrl";
import * as Journalforing from "./modules/journalforing";
import * as Kodeverk from "./modules/kodeverk";
import * as Kontroll from "./modules/kontroll";
import * as Lovvalgsbestemmelser from "./modules/lovvalgsbestemmelser";
import * as Lovvalgsperioder from "./modules/lovvalgsperioder";
import * as MedlemAvFolketrygden from "./modules/medlemavfolketrygden";
import * as Organisasjoner from "./modules/organisasjoner";
import * as Saksopplysninger from "./modules/saksopplysninger";
import * as Oppgaver from "./modules/oppgaver";
import * as Registrering from "./modules/registrering";
import * as Saksflyt from "./modules/saksflyt";
import * as Trygdeavgift from "./modules/trygdeavgift";
import * as Trygdeavtale from "./modules/trygdeavtale/flyt";
import * as Brevutkast from "./modules/brevutkast";
import * as Utpekingsperioder from "./modules/utpekingsperioder";
import * as Vilkar from "./modules/vilkar";
import * as LovligeKombinasjoner from "./modules/lovligekombinasjoner";
import * as Aarsavregning from "./modules/aarsavregning/aarsavregning";
import * as HelseutgiftDekningPeriode from "./modules/helseutgiftDekkesPeriode/helseutgiftDekkesPeriode";
import * as Pensjonsopptjening from "./modules/pensjonsopptjening/pensjonsopptjening";

import {
  Fagsak,
  RegisterAdresse,
  UstrukturertAdresse,
  MidlertidigAdresse,
  StrukturertAdresse,
  Periode,
  Organisasjon,
} from "./modules/types";

export {
  Anmodningsperioder,
  Adresser,
  Avklartefakta,
  Behandlinger,
  MottatteOpplysninger,
  Dokumenter,
  DokumenterV2,
  Eessi,
  Fagsaker,
  Featuretoggle,
  Ftrl,
  Journalforing,
  Kodeverk,
  Kontroll,
  LovligeKombinasjoner,
  Lovvalgsbestemmelser,
  Lovvalgsperioder,
  MedlemAvFolketrygden,
  Oppgaver,
  Organisasjoner,
  Registrering,
  Saksopplysninger,
  Saksflyt,
  Trygdeavgift,
  Faktureringskomponenten,
  Trygdeavtale,
  Brevutkast,
  Utpekingsperioder,
  Vilkar,
  Aarsavregning,
  HelseutgiftDekningPeriode,
  Pensjonsopptjening,
};

export type {
  Fagsak,
  RegisterAdresse,
  UstrukturertAdresse,
  MidlertidigAdresse,
  StrukturertAdresse,
  Periode,
  Organisasjon,
};
