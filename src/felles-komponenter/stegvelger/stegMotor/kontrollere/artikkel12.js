import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArtikkel12 from '../../stegKomponenter/vurderingArtikkel12';

class Artikkel12 extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ];
    this._id = STEG.ARTIKKEL_12;
    this._tittel = 'Vurdering av 12.1';
    this._komponent = VurderingArtikkel12;
    this._samleRelevanteData = _propsLight => ({
      artikkel: { kode: 'FO_883_2004_ART12_1', term: '12.1' },
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

export default Artikkel12;
