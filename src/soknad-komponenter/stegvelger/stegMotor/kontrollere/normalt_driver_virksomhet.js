import * as MKV from 'melosys-kodeverk';
import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingNormaltDriverVirksomhet from '../../stegKomponenter/vurderingNormaltDriverVirksomhet';
import { erVilkarOppfylt } from '../../../../regler/vilkar';

class NormaltDriverVirksomhet extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'SELVSTENDIG_NAERINGSDRIVENDE og VESENTLIG_VIRKSOMHET',
        exec: (avklartefakta, alleVilkar) => erVilkarOppfylt(MKV.Koder.vilkaar.ART12_2_NORMALT_DRIVER_VIRKSOMHET, alleVilkar) !== undefined,
        nesteSteg: STEG.ARTIKKEL_12_2,
      },
      {
        beskrivelse: '',
        exec: () => true,
        nesteSteg: null,
      },
    ];

    this.id = STEG.NORMALT_DRIVER_VIRKSOMHET;
    this.tittel = 'Normalt driver virksomhet';
    this.komponent = VurderingNormaltDriverVirksomhet;
    this.samleRelevanteData = _propsLight => ({
      valgteArbeidsgivere: _propsLight.valgteArbeidsgivere,
      begrunnelser: _propsLight.begrunnelser.art12_2_normalt_virksomhet,
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const { normaltDriverVirksomhet, normaltDriverVirksomhetBegrunnelser = [] } = _propsLight.skjema.vilkar;
      const harAvklaring = normaltDriverVirksomhet === true || (normaltDriverVirksomhet === false && normaltDriverVirksomhetBegrunnelser.length > 0);

      return {
        visBegrunnelser: !_propsLight.skjema.vilkar.normaltDriverVirksomhet,
        harAvklaring,
      };
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      settSkjemaVerdi: this._propsLight.tilgjengeligeHandlers.settSkjemaVerdi,
    };
    this.status = FANE_STATUS.OK;
  }

  static finnAvklaring = (avklartefakta, typeSomSkalSjekkes) => {
    const enkeltFakta = avklartefakta.find(fakta => fakta.referanse === STEG.YRKESAKTIVITET);
    if (!enkeltFakta) { return false; }
    return enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  }
}

export default NormaltDriverVirksomhet;
