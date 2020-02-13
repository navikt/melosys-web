import * as MKV from 'melosys-kodeverk';

import { fjernFlereKoder } from './kodeverk';

/* Filtrerer bort koder som vi ikke ønsker at bruker skal kunne oppgi, men som backend har behov for. */

const filtrertMKV = fjernFlereKoder(MKV, [
  { path: 'begrunnelser.art12_1_vesentlig_virksomhet', kode: 'KONTRAKTER_IKKE_NORSK_LOV' },
  { path: 'begrunnelser.endretperiode', kode: 'ENDRINGER_ARBEIDSSITUASJON' },
]);

export default filtrertMKV;
