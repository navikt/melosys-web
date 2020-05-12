import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingArbeidEttLandOvrigVedtak from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingArbeidEttLandOvrigVedtak';

class ArbeidEttLandOvrigVedtak extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [];
    this.id = STEG.ARBEID_ETT_LAND_OVRIG_VEDTAK;
    this.tittel = 'Vedtak';
    this.komponent = VurderingArbeidEttLandOvrigVedtak;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = () => ({});
    this.handlers = {
      lagreOgFatteVedtak: this._propsLight.tilgjengeligeHandlers.lagreOgFatteVedtak,
      lagreLovvalgsperioder: this._propsLight.tilgjengeligeHandlers.lagreLovvalgsperioder,
      byggLovvalgsperioder: this._propsLight.tilgjengeligeHandlers.byggLovvalgsperioder,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this._status = FANE_STATUS.OK;
  }
}

export default ArbeidEttLandOvrigVedtak;
