import * as MKV from 'melosys-kodeverk';

import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingForretningssted from '../../stegKomponenter/vurderingForretningssted';
import { hentFakta, hentFaktaListe } from '../../../../regler/avklartefakta';
import * as KV from '../../../../kodeverk';
import { hentVilkar } from '../../../../regler/vilkar';

class Forretningssted extends Steg {
  constructor(avklartefakta) {
    super(avklartefakta);
    this.kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ];
    this.id = STEG.FORRETNINGSSTED;
    this.tittel = 'Forretnings\u00ADsted';
    this.komponent = VurderingForretningssted;
    this.samleRelevanteData = _propsLight => ({
      valgteVirksomheter: _propsLight.valgteVirksomheter,
      redigerbart: _propsLight.redigerbart,

      art13_1_b1: hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART13_1_B1, _propsLight.vilkar),
      art13_1_b2: hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART13_1_B2, _propsLight.vilkar),
      art13_1_b3: hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART13_1_B3, _propsLight.vilkar),
      art13_1_b4: hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART13_1_B4, _propsLight.vilkar),
      art14_11: hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART14_11, _propsLight.vilkar),

      avklarteForretningsland: hentFaktaListe(KV.Koder.avklartefaktaKoder.ARBEIDSGIVERS_FORRETNINGSSTED, _propsLight.avklartefakta),
      omfattetINorge: hentFakta(KV.Koder.avklartefaktaKoder.OMFATTES_I_NORGE, _propsLight.avklartefakta),
      omfattetILand: hentFakta(KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND, _propsLight.avklartefakta),
    });

    this.beregnRelevantUI = () => {};
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: (type, felt) => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, type, felt),
      slettAllDataForSteg: () => this._propsLight.tilgjengeligeHandlers.slettAllDataForSteg(this.id),
    };
    this.status = FANE_STATUS.OK;
  }
}

export default Forretningssted;
