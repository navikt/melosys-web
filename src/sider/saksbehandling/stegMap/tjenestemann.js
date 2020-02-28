import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingTjenestemannn from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingTjenestemann';
import * as KV from '../../../kodeverk';

class Tjenestemann extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        exec: ({ vurderingTjenestemann }) => (
          vurderingTjenestemann === KV.Koder.VurderingTjenestemannTyper.ETT_LAND ||
          vurderingTjenestemann === KV.Koder.VurderingTjenestemannTyper.ETT_LAND_YRKESAKTIVITET_ANDRE_LAND ||
          vurderingTjenestemann === KV.Koder.VurderingTjenestemannTyper.FLERE_LAND ||
          vurderingTjenestemann === KV.Koder.VurderingTjenestemannTyper.FLERE_LAND_YRKESAKTIVITET_ANDRE_LAND
        ),
        nesteSteg: null,
      },
      {
        exec: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ];
    this.id = STEG.TJENESTEMANN;
    this.tittel = 'Tjeneste\u00ADmann';
    this.komponent = VurderingTjenestemannn;
    this.samleRelevanteData = () => ({});
    this.beregnRelevantUI = () => ({
      visYrkesgruppeType: true,
    });
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this.status = FANE_STATUS.OK;
  }
}

export default Tjenestemann;
