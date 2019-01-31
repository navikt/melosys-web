import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingVesentligVirksomhet from '../../stegKomponenter/vurderingVesentligVirksomhet';
import { erVilkarOppfylt } from '../../../../regler/vilkar';

import { vilkar } from '../../../../kodeverk/koder';

class VesentligVirksomhet extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'ORDINAER_ARBEIDSTAKER og VESENTLIG_VIRKSOMHET',
        exec: (avklartefakta, alleVilkar) => erVilkarOppfylt(vilkar.ART12_1_VESENTLIG_VIRKSOMHET, alleVilkar) !== undefined,
        nesteSteg: STEG.ARTIKKEL_12_1,
      },
      {
        beskrivelse: '',
        exec: () => true,
        nesteSteg: null,
      },
    ];

    this._id = STEG.VESENTLIG_VIRKSOMHET;
    this._tittel = 'Vesentlig virksomhet';
    this._komponent = VurderingVesentligVirksomhet;
    this._samleRelevanteData = _propsLight => ({
      valgteArbeidsgivere: _propsLight.valgteArbeidsgivere,
      begrunnelser: _propsLight.begrunnelser.art12_1_vesentlig_virksomhet,
      redigerbart: _propsLight.redigerbart,
    });
    this._beregnRelevantUI = _propsLight => {
      const { vesentligVirksomhet, vesentligVirksomhetBegrunnelser = [] } = _propsLight.skjema.vilkar;
      const harAvklaring = vesentligVirksomhet === true || (vesentligVirksomhet === false && vesentligVirksomhetBegrunnelser.length > 0);

      return {
        visBegrunnelser: !vesentligVirksomhet,
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

export default VesentligVirksomhet;
