import * as MKV from 'melosys-kodeverk';

import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArtikkel16 from '../../stegKomponenter/vurderingArtikkel16';
import { hentVilkar } from '../../../../regler/vilkar';

class Artikkel16 extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'alle valg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this.id = STEG.ARTIKKEL_16;
    this.tittel = 'Artikkel 16.1';
    this.komponent = VurderingArtikkel16;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = _propsLight => ({
      art16_1: hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART16_1, _propsLight.vilkar),
    });
    this.handlers = {
      lagreOgFatteVedtak: this._propsLight.tilgjengeligeHandlers.lagreOgFatteVedtak,
      oppdaterOgLagreBehandlinger: this._propsLight.tilgjengeligeHandlers.oppdaterOgLagreBehandlinger,
      lagreVilkarHandler: this._propsLight.tilgjengeligeHandlers.lagreVilkarHandler,
      lagreLovvalgsperioderHandler: this._propsLight.tilgjengeligeHandlers.lagreLovvalgsperioderHandler,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: (type, felt) => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, type, felt),
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Artikkel16;
