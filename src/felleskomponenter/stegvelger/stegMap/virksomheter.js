import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingVirksomhet from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingVirksomhet';
import * as KV from '../../../kodeverk';

import { hentFaktaListe } from '../../../regler/avklartefakta';

class Virksomheter extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [];
    this.id = STEG.VIRKSOMHETER;
    this.tittel = 'Virksomhet';
    this.komponent = VurderingVirksomhet;
    this.samleRelevanteData = _propsLight => ({
      virksomheterIPerioden: _propsLight.virksomheterIPerioden,
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const virksomheter = hentFaktaListe(KV.Koder.avklartefaktaKoder.VIRKSOMHET, _propsLight.avklartefakta);
      const harAvklaring = virksomheter.some(virksomhet => virksomhet.fakta.includes('TRUE'));

      return ({
        harAvklaring,
        virksomheter,
      });
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this._status = FANE_STATUS.OK;
  }

  static harValgtArbeidsgiver = avklartefakta => avklartefakta.some(enkeltFakta => ((enkeltFakta.referanse === KV.Koder.avklartefaktaKoder.VIRKSOMHET) && enkeltFakta.fakta.includes('TRUE')));

  static finnAvklaring = (avklartefakta, typeSomSkalSjekkes) => {
    const enkeltFakta = avklartefakta.find(fakta => fakta.referanse === KV.Koder.avklartefaktaKoder.YRKESGRUPPE);
    if (!enkeltFakta) { return false; }
    return enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  };
}

export default Virksomheter;
