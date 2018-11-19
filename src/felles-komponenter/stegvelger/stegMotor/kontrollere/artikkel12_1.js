import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArtikkel12_1 from '../../stegKomponenter/vurderingArtikkel12_1';
import { erVilkarOppfylt } from '../../../../regler/vilkar';

import * as Koder from '../../../../koder';


class Artikkel12_1 extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'vilkar for artikkel 12.1 er oppfylt',
        exec: (avklartefakta, alleVilkar) => erVilkarOppfylt(Koder.FO_883_2004_ART12_1, alleVilkar),
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
        nesteSteg: STEG.VEDTAK,
      },
    ];
    this._id = STEG.ARTIKKEL_12_1;
    this._tittel = 'Vurdering av 12.1';
    this._komponent = VurderingArtikkel12_1;
    this._samleRelevanteData = _propsLight => ({
      artikkel: { kode: Koder.FO_883_2004_ART12_1, term: '12.1' },
      begrunnelser: _propsLight.begrunnelser.artikkel12_1 || [],
    });
    this._beregnRelevantUI = _propsLight => ({
      visBegrunnelser: _propsLight.skjema.vilkar.art12_1 === false,
      art12_1: _propsLight.skjema.vilkar.art12_1,
      art16_1: _propsLight.skjema.vilkar.art16_1,
    });
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      settSkjemaVerdi: this._propsLight.tilgjengeligeHandlers.settSkjemaVerdi,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Artikkel12_1;
