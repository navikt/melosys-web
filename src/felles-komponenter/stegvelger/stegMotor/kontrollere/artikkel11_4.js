import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArtikkel11_4 from '../../stegKomponenter/vurderingArtikkel11_4';
import { erVilkarOppfylt } from '../../../../regler/vilkar';

import * as Koder from '../../../../koder';

class Artikkel11_4 extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'vilkar for artikkel 12.2 er oppfylt',
        exec: (avklartefakta, alleVilkar) => erVilkarOppfylt(Koder.FO_883_2004_ART12_2, alleVilkar),
        nesteSteg: STEG.VEDTAK,
      },
      {
        beskrivelse: 'ønsker å vurdere 16.1',
        exec: (avklartefakta, alleVilkar) => erVilkarOppfylt(Koder.FO_883_2004_ART16_1, alleVilkar),
        nesteSteg: STEG.ARTIKKEL_16,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this._id = STEG.ARTIKKEL_11_4;
    this._tittel = 'Vurdering av 11.4';
    this._komponent = VurderingArtikkel11_4;
    this._samleRelevanteData = _propsLight => ({
      artikkel: { kode: Koder.FO_883_2004_ART12_2, term: '11.4' },
      begrunnelser: _propsLight.begrunnelser.artikkel11_4 || [],
    });
    this._beregnRelevantUI = _propsLight => {
      const { art12_2, art16_1, art12_2_begrunnelser = [] } = _propsLight.skjema.vilkar;
      const manglerBegrunnelse = art12_2 === false && art12_2_begrunnelser.length === 0;
      const harAvklaring = (art12_2 !== null && art12_2 !== undefined) || (art16_1 !== null && art16_1 !== undefined);

      return {
        harAvklaring: harAvklaring && !manglerBegrunnelse,
        visBegrunnelser: _propsLight.skjema.vilkar.art12_2 === false || (art12_2 === undefined && art16_1 === undefined),
        art12_2: _propsLight.skjema.vilkar.art12_2,
        art16_1: _propsLight.skjema.vilkar.art16_1,
      };
    };
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      settSkjemaVerdi: this._propsLight.tilgjengeligeHandlers.settSkjemaVerdi,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Artikkel11_4;
