import { KTObject } from "@navikt/melosys-kodeverk";

import { Periode } from "./periode";

type BehandlingOversikt = {
  behandlingID: number;
  behandlingsstatus: KTObject;
  behandlingstype: KTObject;
  land: string[];
  opprettetDato: string;
  periode: Periode;
};

type Fagsak = {
  saksnummer: string;
  sakstype: KTObject;
  saksstatus: KTObject;
  registrertDato: string;
  endretDato: string;
  gsakSaksnummer: number;
  behandlingOversikter: BehandlingOversikt[];
};

export default Fagsak;
