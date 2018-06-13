import Steg from '../steg';
import { STEG } from '../../stegLogikk/typer';
import VurderingTjenestemannn, { VurderingTjenestemannTyper } from '../../vurderinger/vurderingTjenestemann';

class Tjenestemann extends Steg {
  constructor(faktaavklaring) {
    super(faktaavklaring);
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
        nesteSteg: STEG.VEDTAK,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ];
    this._id = STEG.SYSSELSETTING;
    this._komponent = VurderingTjenestemannn;
  }
}

export default Tjenestemann;
