import { KTObject } from "@navikt/melosys-kodeverk";
import Periode from "./periode";
import { Soeknadsland } from "../behandlingsgrunnlag/types";

type Fagsak = {
  saksnummer: string;
  gsakSaksnummer: number;
  sakstype: KTObject;
  saksstatus: KTObject;
  registrertDato: string;
  endretDato: string;
  hovedpartRolle: string;
};

export type FagsakOppsummering = {
  saksnummer: string;
  navn: string;
  sakstype: KTObject;
  saksstatus: KTObject;
  opprettetDato: string;
  behandlingOversikter: {
    behandlingID: string;
    behandlingsstatus: KTObject;
    behandlingstype: KTObject;
    behandlingstema: KTObject;
    periode: Periode;
    land: Soeknadsland;
    opprettetDato: string;
  }[];
  hovedpartRolle: string;
};

export default Fagsak;
