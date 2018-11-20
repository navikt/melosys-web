import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingNormaltDriverVirksomhet from '../../stegKomponenter/vurderingNormaltDriverVirksomhet';
import { erVilkarOppfylt } from '../../../../regler/vilkar';

import * as Koder from '../../../../koder';

class NormaltDriverVirksomhet extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'SELVSTENDIG_NAERINGSDRIVENDE og VESENTLIG_VIRKSOMHET',
        exec: (avklartefakta, alleVilkar) => erVilkarOppfylt(Koder.NORMALT_DRIVER_VIRKSOMHET, alleVilkar),
        nesteSteg: STEG.ARTIKKEL_12_2,
      },
      {
        beskrivelse: '',
        exec: () => true,
        nesteSteg: null,
      },
    ];

    this._id = STEG.NORMALT_DRIVER_VIRKSOMHET;
    this._tittel = 'Vesentlig virksomhet';
    this._komponent = VurderingNormaltDriverVirksomhet;
    this._samleRelevanteData = _propsLight => ({
      valgteArbeidsgivere: _propsLight.valgteArbeidsgivere,
      begrunnelser: _propsLight.begrunnelser.normaltDriverVirksomhet,
    });
    this._beregnRelevantUI = _propsLight => ({
      visBegrunnelser: !_propsLight.skjema.vilkar.normaltDriverVirksomhet,
    });
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
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
