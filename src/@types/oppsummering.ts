import { KTObject } from "@navikt/melosys-kodeverk";

type Oppsummering = {
  saksnummer: string;
  sakstype: KTObject;
  status: KTObject;
  registrertDato: string;
  endretDato: string;
  endretAvNavn: string;
  sisteOpplysningerHentetDato: string;
  behandlingstype: string;
  behandlingsstatus: string;
  svarFrist: string;
};

export default Oppsummering;
