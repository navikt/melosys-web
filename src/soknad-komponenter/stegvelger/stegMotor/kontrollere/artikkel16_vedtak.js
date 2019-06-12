import * as MKV from 'melosys-kodeverk';

import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArtikkel16Vedtak from '../../stegKomponenter/VurderingArtikkel16Vedtak';
import { hentVilkar } from '../../../../regler/vilkar';

class Artikkel16Vedtak extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'alle valg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this.id = STEG.ARTIKKEL_16_VEDTAK;
    this.tittel = 'Artikkel 16.1 Vedtak';
    this.komponent = VurderingArtikkel16Vedtak;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = _propsLight => ({
      art16_1: hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART16_1, _propsLight.vilkar),
    });
    this.handlers = {
      lagreOgFatteVedtak: this._propsLight.tilgjengeligeHandlers.lagreOgFatteVedtak,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Artikkel16Vedtak;
