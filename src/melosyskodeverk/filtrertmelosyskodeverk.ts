import * as MKV from "@navikt/melosys-kodeverk";

import { fjernFlereKoder } from "./fjernkoder";

/* Filtrerer bort koder som vi ikke ønsker at bruker skal kunne oppgi, men som backend har behov for. */

const filtrertMKV = fjernFlereKoder(MKV, [
  { path: "begrunnelser.art12_1_vesentlig_virksomhet", kode: "KONTRAKTER_IKKE_NORSK_LOV" },
  { path: "begrunnelser.endretperiode", kode: "ENDRINGER_ARBEIDSSITUASJON" },
  { path: "behandlinger.behandlingsaarsaktyper", kode: "ANNET" },
]);

export default filtrertMKV;
