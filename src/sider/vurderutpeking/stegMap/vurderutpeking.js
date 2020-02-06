import * as KV from '../../../kodeverk';
import * as Utils from '../../../utils';

import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingNorgeUtpekt from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingNorgeUtpekt';

import { hentLovvalgsbestemmelse } from '../../../regler/lovvalgsbestemmelser';
import { hentFakta } from '../../../regler/avklartefakta';

class VurderUtpeking extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const { lovvalgsperioder, avklartefakta, vurderUtpekingValid } = propsLight;
    const lovvalgsbestemmelse = hentLovvalgsbestemmelse(lovvalgsperioder);
    const utpekingGodkjentFakta = hentFakta(KV.Koder.avklartefaktaKoder.UTPEKING_GODKJENT, avklartefakta);
    const harAvklaring = this.harAvklaring(lovvalgsbestemmelse, utpekingGodkjentFakta, vurderUtpekingValid);

    this.kriterier = [
      {
        exec: () => harAvklaring,
        nesteSteg: '',
      },
    ];
    this.id = STEG.VURDER_UTPEKING;
    this.tittel = 'Vurdering';
    this.komponent = VurderingNorgeUtpekt;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = _propsLight => ({
      harAvklaring,
      lovvalgsbestemmelse,
      utpekingGodkjentFakta,
    });
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this._status = FANE_STATUS.OK;
  }

  harAvklaring = (lovvalgsbestemmelse, utpekingGodkjentFakta, vurderUtpekingValid) => (
    Boolean(lovvalgsbestemmelse && !Utils._isEmpty(utpekingGodkjentFakta) && vurderUtpekingValid)
  );
}

export default VurderUtpeking;
