import { KTObject } from "@navikt/melosys-kodeverk";

type Fagsak = {
  saksnummer: string;
  sakstype: KTObject;
  saksstatus: KTObject;
  registrertDato: string;
  endretDato: string;
  gsakSaksnummer: number;
};

export default Fagsak;
