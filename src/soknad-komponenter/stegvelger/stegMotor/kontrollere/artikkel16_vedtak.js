import * as MKV from 'melosys-kodeverk';

import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArtikkel16Vedtak from '../../stegKomponenter/vurderingArtikkel16Vedtak';
import { hentVilkar } from '../../../../regler/vilkar';
import { hentFakta } from '../../../../regler/avklartefakta';

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
      svarAnmodningUnntakFritekst: hentFakta(MKV.Koder.avklartefakta.SVAR_ANMODNING_UNNTAK, _propsLight.avklartefakta).begrunnelseFritekst,
    });
    this.handlers = {
      lagreOgFatteVedtak: this._propsLight.tilgjengeligeHandlers.lagreOgFatteVedtak,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Artikkel16Vedtak;
