import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingVesentligVirksomhet from '../../stegKomponenter/vurderingVesentligVirksomhet';
import { erVilkarOppfylt } from '../../../../regler/vilkar';

import * as Koder from '../../../../koder';
import { VurderingYrkesaktivitetTyper } from '../../stegKomponenter/vurderingYrkesaktivitet';

class VesentligVirksomhet extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'ORDINAER_ARBEIDSTAKER og VESENTLIG_VIRKSOMHET',
        exec: (avklartefakta, alleVilkar) => {
          const erOrdinaerArbeidstaker = VesentligVirksomhet.finnAvklaring(avklartefakta, VurderingYrkesaktivitetTyper.ORDINAER_ARBEIDSTAKER);
          const erVesentligVirksomhet = erVilkarOppfylt(Koder.VESENTLIG_VIRKSOMHET, alleVilkar);
          return erOrdinaerArbeidstaker && erVesentligVirksomhet;
        },
        nesteSteg: STEG.ARTIKKEL_12_1,
      },
      {
        beskrivelse: 'SELVSTENDIG_NAERINGSDRIVENDE og VESENTLIG_VIRKSOMHET',
        exec: (avklartefakta, alleVilkar) => {
          const erSelvstendigNaeringsdrivende = VesentligVirksomhet.finnAvklaring(avklartefakta, VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE);
          const erVesentligVirksomhet = erVilkarOppfylt(Koder.VESENTLIG_VIRKSOMHET, alleVilkar);
          return erSelvstendigNaeringsdrivende && erVesentligVirksomhet;
        },
        nesteSteg: STEG.ARTIKKEL_12_2,
      },
    ];

    this._id = STEG.VESENTLIG_VIRKSOMHET;
    this._tittel = 'Vesentlig virksomhet';
    this._komponent = VurderingVesentligVirksomhet;
    this._samleRelevanteData = _propsLight => {
      const { avklartefakta } = _propsLight;
      const erOrdinaerArbeidstaker = VesentligVirksomhet.finnAvklaring(avklartefakta, VurderingYrkesaktivitetTyper.ORDINAER_ARBEIDSTAKER);
      const erSelvstendigNaeringsdrivende = VesentligVirksomhet.finnAvklaring(avklartefakta, VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE);

      let begrunnelser;
      if (erOrdinaerArbeidstaker) {
        begrunnelser = _propsLight.begrunnelser.vesentligVirksomhet12_1;
      }

      if (erSelvstendigNaeringsdrivende) {
        begrunnelser = _propsLight.begrunnelser.vesentligVirksomhet12_2;
      }

      return {
        valgteArbeidsgivere: _propsLight.valgteArbeidsgivere,
        begrunnelser: begrunnelser || [],
      };
    };
    this._beregnRelevantUI = _propsLight => ({
      visBegrunnelser: !_propsLight.skjema.vilkar.vesentligVirksomhet,
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

export default VesentligVirksomhet;
