import * as MKV from 'melosys-kodeverk';

import { fjernFlereKoder } from './fjernkoder';

describe('fjernFlereKoder', () => {
  it('fjerner koder', () => {
    const rensetKodeverk = fjernFlereKoder(MKV, [{ path: 'begrunnelser.art12_1_vesentlig_virksomhet', kode: 'KONTRAKTER_IKKE_NORSK_LOV' }]);

    expect(rensetKodeverk.Koder.begrunnelser.art12_1_vesentlig_virksomhet.KONTRAKTER_IKKE_NORSK_LOV).toBeUndefined();
    expect(rensetKodeverk.Terms.begrunnelser.art12_1_vesentlig_virksomhet.KONTRAKTER_IKKE_NORSK_LOV).toBeUndefined();
    expect(rensetKodeverk.KTObjects.begrunnelser.art12_1_vesentlig_virksomhet.find(({ kode }) => (
      kode === MKV.Koder.begrunnelser.art12_1_vesentlig_virksomhet.KONTRAKTER_IKKE_NORSK_LOV
    ))).toBeUndefined();
  });

  it('muterer ikke kodeverk', () => {
    fjernFlereKoder(MKV, [{ path: 'begrunnelser.art12_1_vesentlig_virksomhet', kode: 'KONTRAKTER_IKKE_NORSK_LOV' }]);

    expect(MKV.Koder.begrunnelser.art12_1_vesentlig_virksomhet.KONTRAKTER_IKKE_NORSK_LOV).toBeDefined();
    expect(MKV.Terms.begrunnelser.art12_1_vesentlig_virksomhet.KONTRAKTER_IKKE_NORSK_LOV).toBeDefined();
    expect(MKV.KTObjects.begrunnelser.art12_1_vesentlig_virksomhet.find(({ kode }) => (
      kode === MKV.Koder.begrunnelser.art12_1_vesentlig_virksomhet.KONTRAKTER_IKKE_NORSK_LOV
    ))).toBeDefined();
  });
});
