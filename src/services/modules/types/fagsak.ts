import { KTObject } from "@navikt/melosys-kodeverk";
import { Soeknadsland } from "../mottatteOpplysninger/types";
import Periode from "./periode";

export interface FullmektigHistorikk {
  registrertFra: string;
  registrertTil: string | undefined;
  aktoerID: string | undefined;
  personIdent: string | undefined;
  institusjonsID: string | undefined;
  orgnr: string | undefined;
  rolle: string;
  fullmakter: string[];
}

interface Fagsak {
  saksnummer: string;
  gsakSaksnummer: number;
  sakstype: KTObject;
  sakstema: KTObject;
  saksstatus: KTObject;
  registrertDato: string;
  endretDato: string;
  hovedpartRolle: string;
}

export interface FagsakOppsummering {
  saksnummer: string;
  navn: string;
  sakstype: KTObject;
  sakstema: KTObject;
  saksstatus: KTObject;
  land: Soeknadsland;
  periode?: Periode;
  opprettetDato: string;
  behandlingOversikter: {
    behandlingID: number;
    tittel?: string;
    behandlingsstatus: KTObject;
    behandlingstype: KTObject;
    behandlingstema: KTObject;
    opprettetDato: string;
    behandlingsresultattype: KTObject;
    svarFrist: string;
  }[];
  hovedpartRolle: string;
}

export default Fagsak;
