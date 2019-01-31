import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArtikkel12_1 from '../../stegKomponenter/vurderingArtikkel12_1';
import { erVilkarOppfylt } from '../../../../regler/vilkar';

import { vilkar } from '../../../../kodeverk/koder';


class Artikkel12_1 extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'vilkar for artikkel 12.1 er oppfylt',
        exec: (avklartefakta, alleVilkar) => erVilkarOppfylt(vilkar.FO_883_2004_ART12_1, alleVilkar),
        nesteSteg: STEG.VEDTAK,
      },
      {
        beskrivelse: 'ønsker å vurdere 16.1',
        exec: (avklartefakta, alleVilkar) => erVilkarOppfylt(vilkar.FO_883_2004_ART16_1, alleVilkar),
        nesteSteg: STEG.ARTIKKEL_16,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this._id = STEG.ARTIKKEL_12_1;
    this._tittel = 'Vurdering av 12.1';
    this._komponent = VurderingArtikkel12_1;
    this._samleRelevanteData = _propsLight => ({
      artikkel: { kode: vilkar.FO_883_2004_ART12_1, term: '12.1' },
      begrunnelser: _propsLight.begrunnelser.art12_1_begrunnelser || [],
      redigerbart: _propsLight.redigerbart,
    });
    this._beregnRelevantUI = _propsLight => {
      const { art12_1, art16_1, art12_1_begrunnelser = [] } = _propsLight.skjema.vilkar;
      const manglerBegrunnelse = art12_1 === false && art12_1_begrunnelser.length === 0;
      const harAvklaring = (art12_1 !== null && art12_1 !== undefined) || (art16_1 !== null && art16_1 !== undefined);

      return {
        harAvklaring: harAvklaring && !manglerBegrunnelse,
        visBegrunnelser: art12_1 === false || (art12_1 === undefined && art16_1 === undefined),
        art12_1,
        art16_1,
      };
    };
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      settSkjemaVerdi: this._propsLight.tilgjengeligeHandlers.settSkjemaVerdi,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Artikkel12_1;
