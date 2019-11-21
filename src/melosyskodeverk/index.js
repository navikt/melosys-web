import * as MKV from 'melosys-kodeverk';

/* Filtrerer bort koder som vi ikke ønsker at bruker skal kunne oppgi, men som backend har behov for. */

const filtrertMKV = { ...MKV };

filtrertMKV.KTObjects.begrunnelser.art12_1_vesentlig_virksomhet = MKV.KTObjects.begrunnelser.art12_1_vesentlig_virksomhet.filter(({ kode }) => (
  kode !== MKV.Koder.begrunnelser.art12_1_vesentlig_virksomhet.KONTRAKTER_IKKE_NORSK_LOV
));
delete filtrertMKV.Koder.begrunnelser.art12_1_vesentlig_virksomhet.KONTRAKTER_IKKE_NORSK_LOV;
delete filtrertMKV.Terms.begrunnelser.art12_1_vesentlig_virksomhet.KONTRAKTER_IKKE_NORSK_LOV;

export default filtrertMKV;
