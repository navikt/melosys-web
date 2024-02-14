import { KTObject } from "@navikt/melosys-kodeverk";
import { Soeknadsland } from "../mottatteOpplysninger/types";
import Periode from "./periode";

export type FullmektigHistorikk = {
  registrertFra: string;
  registrertTil: string | undefined;
  aktoerID: string | undefined;
  personIdent: string | undefined;
  institusjonsID: string | undefined;
  orgnr: string | undefined;
  rolle: string;
  fullmakter: string[];
};

type Fagsak = {
  saksnummer: string;
  gsakSaksnummer: number;
  sakstype: KTObject;
  sakstema: KTObject;
  saksstatus: KTObject;
  registrertDato: string;
  endretDato: string;
  hovedpartRolle: string;
};

export type FagsakOppsummering = {
  saksnummer: string;
  navn: string;
  sakstype: KTObject;
  sakstema: KTObject;
  saksstatus: KTObject;
  opprettetDato: string;
  behandlingOversikter: {
    behandlingID: string;
    behandlingsstatus: KTObject;
    behandlingstype: KTObject;
    behandlingstema: KTObject;
    lovvalgsperiode?: Periode;
    medlemskapsperioder?: Periode;
    land: Soeknadsland;
    opprettetDato: string;
    behandlingsresultattype: KTObject;
    svarFrist: string;
  }[];
  hovedpartRolle: string;
};

export default Fagsak;
