import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArtikkel13_1_a_vedtak from '../../stegKomponenter/vurderingArtikkel13_1_a_vedtak';

class Artikkel13_1_a_vedtak extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this.id = STEG.ARTIKKEL_13_1_A_VEDTAK;
    this.tittel = 'Vedtak';
    this.komponent = VurderingArtikkel13_1_a_vedtak;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = _propsLight => ({});
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      endreDatoOgSendLovvalgsperioder: this._propsLight.tilgjengeligeHandlers.endreDatoOgSendLovvalgsperioderHandler,
      lagreOgFatteVedtak: this._propsLight.tilgjengeligeHandlers.lagreOgFatteVedtak,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Artikkel13_1_a_vedtak;
