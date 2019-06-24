import * as MKV from 'melosys-kodeverk';

import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArtikkel13_1_a_vedtak from '../../stegKomponenter/vurderingArtikkel13_1_a_vedtak';
import { erVilkarOppfylt, hentVilkar } from '../../../../regler/vilkar';
import { hentFakta } from '../../../../regler/avklartefakta';
import * as Utils from '../../../../utils';

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
    this.beregnRelevantUI = _propsLight => {
      const aarsakEndringPeriodeFakta = hentFakta(MKV.Koder.avklartefakta.AARSAK_ENDRING_PERIODE, _propsLight.avklartefakta);

      return {
        aarsakEndringPeriodeFakta,
      };
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      endreDatoOgSendLovvalgsperioder: this._propsLight.tilgjengeligeHandlers.endreDatoOgSendLovvalgsperioderHandler,
      lagreOgFatteVedtak: this._propsLight.tilgjengeligeHandlers.lagreOgFatteVedtak,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Artikkel13_1_a_vedtak;
