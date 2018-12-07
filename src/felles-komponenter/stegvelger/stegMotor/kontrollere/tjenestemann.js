import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingTjenestemannn, { VurderingTjenestemannTyper } from '../../stegKomponenter/vurderingTjenestemann';

class Tjenestemann extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'vurderingTjenestemann ER LIK "ETT_LAND" eller vurderingTjenestemann ER LIK "ETT_LAND_YRKESAKTIVITET_ANDRE_LAND" ' +
        'eller vurderingTjenestemann ER LIK "FLERE_LAND" eller vurderingTjenestemann ER LIK "FLERE_LAND_YRKESAKTIVITET_ANDRE_LAND"',
        exec: ({ vurderingTjenestemann }) => (
          vurderingTjenestemann === VurderingTjenestemannTyper.ETT_LAND ||
          vurderingTjenestemann === VurderingTjenestemannTyper.ETT_LAND_YRKESAKTIVITET_ANDRE_LAND ||
          vurderingTjenestemann === VurderingTjenestemannTyper.FLERE_LAND ||
          vurderingTjenestemann === VurderingTjenestemannTyper.FLERE_LAND_YRKESAKTIVITET_ANDRE_LAND
        ),
        nesteSteg: null,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ];
    this._id = STEG.TJENESTEMANN;
    this._tittel = 'Tjeneste\u00ADmann';
    this._komponent = VurderingTjenestemannn;
    this._samleRelevanteData = () => ({});
    this._beregnRelevantUI = () => ({
      visYrkesgruppeType: true,
    });
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Tjenestemann;
