import Steg from '../../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingBestemmelse from '../../../../felleskomponenter/stegvelger/stegKomponenter/ftrl/vurderingBestemmelse';

class Bestemmelse extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    const harAvklaring = false;
    this.kriterier = [
      {
        exec: () => harAvklaring,
        nesteSteg: STEG.PERIODER,
      },
    ];
    this.id = STEG.BESTEMMELSE;
    this.tittel = 'Bestemmelse';
    this.komponent = VurderingBestemmelse;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.redigerbart,
      vilkar: _propsLight.vilkar,
      bestemmelseVilkår: _propsLight.bestemmelser,
    });
    this.beregnRelevantUI = _propsLight => ({ harAvklaring: false });
    this.handlers = {
      bekreft: propsLight.tilgjengeligeHandlers.bekreft,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      oppdater: propsLight.tilgjengeligeHandlers.oppdater,
      lagreVilkar: propsLight.tilgjengeligeHandlers.lagreVilkar,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
    };
    this.status = FANE_STATUS.OK;
  }
}
export default Bestemmelse;
