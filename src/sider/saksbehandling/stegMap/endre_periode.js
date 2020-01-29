import MKV from '../../../melosyskodeverk';

import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingEndrePeriode from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingEndrePeriode';
import { hentFakta } from '../../../regler/avklartefakta';

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
      aarsakEndringPeriodeAvklartfakta: hentFakta(MKV.Koder.avklartefaktatyper.AARSAK_ENDRING_PERIODE, _propsLight.avklartefakta),
    });
    this.handlers = {
      tilForsiden: this._propsLight.tilgjengeligeHandlers.tilForsiden,
      endreVedtak: this._propsLight.tilgjengeligeHandlers.endreVedtak,
      endreDatoOgSendLovvalgsperioderHandler: this._propsLight.tilgjengeligeHandlers.endreDatoOgSendLovvalgsperioderHandler,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this.status = FANE_STATUS.OK;
  }
}

export default EndrePeriode;
