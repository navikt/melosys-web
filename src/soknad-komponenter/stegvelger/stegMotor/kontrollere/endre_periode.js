import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingEndrePeriode from '../../stegKomponenter/vurderingEndrePeriode';

class EndrePeriode extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: false,
      },
    ];
    this.id = STEG.ENDRET_PERIODE;
    this.tittel = 'Endre lovvalgsperiode';
    this.komponent = VurderingEndrePeriode;
    this.samleRelevanteData = () => ({});
    this.beregnRelevantUI = () => ({});
    this.handlers = {
      tilForsiden: this._propsLight.tilgjengeligeHandlers.tilForsiden,
      vedtaEndretPeriode: this._propsLight.tilgjengeligeHandlers.vedtaEndretPeriode,
      endreDatoOgSendLovvalgsperioderHandler: this._propsLight.tilgjengeligeHandlers.endreDatoOgSendLovvalgsperioderHandler,
    };
    this.status = FANE_STATUS.OK;
  }
}

export default EndrePeriode;
