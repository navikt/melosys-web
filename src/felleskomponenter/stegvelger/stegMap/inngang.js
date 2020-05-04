import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingInngang from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingInngang';
import * as KV from '../../../kodeverk';

class Inngang extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    this.kriterier = [];
    this.id = STEG.INNGANG;
    this.tittel = 'Inngang';
    this.komponent = VurderingInngang;
    this.samleRelevanteData = _propsLight => ({
      begrunnelser: _propsLight.begrunnelser,
      alleLandkoder: _propsLight.landkoder,
      avklartefakta: _propsLight.avklartefakta,
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const harAvklaring = this.harAvklaring(_propsLight.soknadslandFaktaer);

      return ({
        harAvklaring,
      });
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this.status = FANE_STATUS.OK;
  }

  harAvklaring = avklartefakta => (
    avklartefakta.some(enkeltFakta => (
      (enkeltFakta.referanse === KV.Koder.SOKNADSLAND) &&
      this.faktaErSannEllerIkkeArbeidsland(enkeltFakta.fakta)
    ))
  )

  faktaErSannEllerIkkeArbeidsland = fakta => (
    fakta.includes(KV.Koder.SoknadslandFaktaTyper.SANN) ||
    fakta.includes(KV.Koder.SoknadslandFaktaTyper.IKKE_ARBEIDSLAND)
  )
}

export default Inngang;
