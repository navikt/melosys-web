import MKV from '../../../melosyskodeverk';
import VilkaarStore from './VilkaarStore';
import { konverterTilStegData, lagBegrunnelse, lagVilkaar } from '../../../regler/vilkar';

const eksisterendeVilkar = {
  vilkaar: MKV.Koder.vilkaar.FO_883_2004_ART11_3A,
  oppfylt: false,
  begrunnelseKoder: ['Annet'],
  begrunnelseFritekst: 'Suspekt bruk av gjemmekontor',
};

describe('VilkaarStore oppdatering av eksisterende data', () => {
  let store;
  beforeEach(() => {
    store = new VilkaarStore();

    const vilkaarCmd = konverterTilStegData('art11_3A', eksisterendeVilkar);
    store.oppdaterStegData('TESTSTEG-1', vilkaarCmd);
  });

  it('Lagring av eksisterende vilkaar', () => {
    const vilkaar = store.hent();
    expect(vilkaar.art11_3A).toBeFalsy();
    expect(vilkaar.art11_3A_begrunnelser).toEqual(eksisterendeVilkar.begrunnelseKoder);
    expect(vilkaar.art11_3A_begrunnelser_fritekst).toEqual(eksisterendeVilkar.begrunnelseFritekst);
  });

  it('Oppdater eksisterende vilkaar', () => {
    const vilkaarCmd = lagVilkaar('art11_3A', true);
    store.oppdaterStegData('TESTSTEG-1', vilkaarCmd);

    const vilkaar = store.hent();
    expect(vilkaar.art11_3A).toBeTruthy();
  });

  it('Oppdater vilkaarbegrunnelse', () => {
    const vilkaarCmd = lagBegrunnelse('art11_3A', ['Mer enn 5 år'], 'Fritekst');
    store.oppdaterStegData('TESTSTEG-1', vilkaarCmd);

    const vilkaar = store.hent();
    expect(vilkaar.art11_3A).toBeFalsy();
    expect(vilkaar.art11_3A_begrunnelser).toEqual(['Mer enn 5 år']);
    expect(vilkaar.art11_3A_begrunnelser_fritekst).toEqual('Fritekst');
  });

  it('Legg til vilkaar', () => {
    const vilkaarCmd = lagVilkaar('art12_1', true);
    store.oppdaterStegData('TESTSTEG-1', vilkaarCmd);
    const vilkaar = store.hent();
    expect(vilkaar.art11_3A).toBeFalsy();
    expect(vilkaar.art12_1).toBeTruthy();
  });
});
