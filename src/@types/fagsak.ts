import { KTObject } from "@navikt/melosys-kodeverk";

import { Periode } from "./periode";

/**
 * @deprecated Typer fra Api flyttes til Api-modul
 */
type BehandlingOversikt = {
  behandlingID: number;
  behandlingsstatus: KTObject;
  behandlingstype: KTObject;
  land: string[];
  opprettetDato: string;
  periode: Periode;
};

/**
 * @deprecated Typer fra Api flyttes til Api-modul
 */
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
