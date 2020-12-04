import * as KV from '../../../kodeverk';

import MKV from '../../../melosyskodeverk';

import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingMedfolgendeBarn from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingMedfolgendeBarn';
import { hentFaktaListe } from '../../../regler/avklartefakta';

class VesentligVirksomhet extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const vurderingLovvalgBarnFakta = hentFaktaListe(MKV.Koder.avklartefaktatyper.VURDERING_LOVVALG_BARN, this._propsLight.avklartefakta);

    const harAvklaring = this.harAvklaring(vurderingLovvalgBarnFakta);

    this.kriterier = [
      {
        exec: () => harAvklaring,
        nesteSteg: STEG.VEDTAK,
      },
    ];

    this.id = STEG.MEDFOLGENDE_BARN;
    this.tittel = 'Barn';
    this.komponent = VurderingMedfolgendeBarn;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
      vurderingLovvalgBarnFakta,
    });
    this.beregnRelevantUI = _propsLight => ({
      harAvklaring,
    });
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this.status = FANE_STATUS.OK;
  }

  harAvklaring = avklartefakta => avklartefakta.every(enkeltFakta => (
    enkeltFakta.fakta.includes(KV.Koder.BoolskAvklartfaktaType.SANN) ||
      (
        enkeltFakta.fakta.includes(KV.Koder.BoolskAvklartfaktaType.USANN) &&
        enkeltFakta.begrunnelseKoder.length > 0
      )
  ))
}

export default VesentligVirksomhet;
