import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingNormaltDriverVirksomhet from '../../stegKomponenter/vurderingNormaltDriverVirksomhet';
import { erVilkarOppfylt } from '../../../../regler/vilkar';

import { vilkar } from '../../../../kodeverk/koder';

class NormaltDriverVirksomhet extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'SELVSTENDIG_NAERINGSDRIVENDE og VESENTLIG_VIRKSOMHET',
        exec: (avklartefakta, alleVilkar) => erVilkarOppfylt(vilkar.ART12_2_NORMALT_DRIVER_VIRKSOMHET, alleVilkar) !== undefined,
        nesteSteg: STEG.ARTIKKEL_12_2,
      },
      {
        beskrivelse: '',
        exec: () => true,
        nesteSteg: null,
      },
    ];

    this._id = STEG.NORMALT_DRIVER_VIRKSOMHET;
    this._tittel = 'Normalt driver virksomhet';
    this._komponent = VurderingNormaltDriverVirksomhet;
    this._samleRelevanteData = _propsLight => ({
      valgteArbeidsgivere: _propsLight.valgteArbeidsgivere,
      begrunnelser: _propsLight.begrunnelser.art12_2_normalt_virksomhet,
      redigerbart: _propsLight.redigerbart,
    });
    this._beregnRelevantUI = _propsLight => {
      const { normaltDriverVirksomhet, normaltDriverVirksomhetBegrunnelser = [] } = _propsLight.skjema.vilkar;
      const harAvklaring = normaltDriverVirksomhet === true || (normaltDriverVirksomhet === false && normaltDriverVirksomhetBegrunnelser.length > 0);

      return {
        visBegrunnelser: !_propsLight.skjema.vilkar.normaltDriverVirksomhet,
        harAvklaring,
      };
    };
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      settSkjemaVerdi: this._propsLight.tilgjengeligeHandlers.settSkjemaVerdi,
    };
    this._status = FANE_STATUS.OK;
  }

  static finnAvklaring = (avklartefakta, typeSomSkalSjekkes) => {
    const enkeltFakta = avklartefakta.find(fakta => fakta.referanse === STEG.YRKESAKTIVITET);
    if (!enkeltFakta) { return false; }
    return enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  }
}

export default NormaltDriverVirksomhet;
