import * as MKV from 'melosys-kodeverk';

import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingEndrePeriode from '../../stegKomponenter/vurderingEndrePeriode';
import { hentFakta } from '../../../../regler/avklartefakta';

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
    this.samleRelevanteData = _propsLight => ({ behandlingID: _propsLight.behandlingID }); // TODO; Refactor with React Context API!!!
    this.beregnRelevantUI = _propsLight => ({
      aarsakEndringPeriodeAvklartfakta: hentFakta(MKV.Koder.avklartefakta.AARSAK_ENDRING_PERIODE, _propsLight.avklartefakta),
    });
    this.handlers = {
      tilForsiden: this._propsLight.tilgjengeligeHandlers.tilForsiden,
      vedtaEndretPeriode: this._propsLight.tilgjengeligeHandlers.vedtaEndretPeriode,
      endreDatoOgSendLovvalgsperioderHandler: this._propsLight.tilgjengeligeHandlers.endreDatoOgSendLovvalgsperioderHandler,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this.status = FANE_STATUS.OK;
  }
}

export default EndrePeriode;
