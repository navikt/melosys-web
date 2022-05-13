import { KTObject } from "@navikt/melosys-kodeverk";
import Periode from "./periode";
import { Soeknadsland } from "../behandlingsgrunnlag/types";

type Fagsak = {
  saksnummer: string;
  sakstype: KTObject;
  saksstatus: KTObject;
  registrertDato: string;
  endretDato: string;
  gsakSaksnummer: number;
};

export type FagsakOppsummering = {
  navn: string;
  saksnummer: string;
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
};

export default Fagsak;
