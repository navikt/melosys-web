import * as MKV from 'melosys-kodeverk';

import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingVesentligVirksomhet from '../../stegKomponenter/vurderingVesentligVirksomhet';
import { erVilkarOppfylt, hentVilkar } from '../../../../../../regler/vilkar';

class VesentligVirksomhet extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'ORDINAER_ARBEIDSTAKER og VESENTLIG_VIRKSOMHET',
        exec: (avklartefakta, alleVilkar) => erVilkarOppfylt(MKV.Koder.vilkaar.ART12_1_VESENTLIG_VIRKSOMHET, alleVilkar) !== undefined,
        nesteSteg: STEG.ARTIKKEL_12_1,
      },
      {
        beskrivelse: '',
        exec: () => true,
        nesteSteg: null,
      },
    ];

    this.id = STEG.VESENTLIG_VIRKSOMHET;
    this.tittel = 'Vesentlig virksomhet';
    this.komponent = VurderingVesentligVirksomhet;
    this.samleRelevanteData = _propsLight => ({
      valgteVirksomheter: _propsLight.valgteVirksomheter,
      begrunnelser: _propsLight.begrunnelser.art12_1_vesentlig_virksomhet,
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const vesentligVirksomhetVilkaar = hentVilkar(MKV.Koder.vilkaar.ART12_1_VESENTLIG_VIRKSOMHET, _propsLight.vilkar);
      const harAvklaring = vesentligVirksomhetVilkaar.oppfylt === true || (vesentligVirksomhetVilkaar.oppfylt === false && vesentligVirksomhetVilkaar.begrunnelseKoder.length > 0);

      return {
        visBegrunnelser: !vesentligVirksomhetVilkaar.oppfylt,
        harAvklaring,
        vesentligVirksomhetVilkaar,
      };
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this.status = FANE_STATUS.OK;
  }

  static finnAvklaring = (avklartefakta, typeSomSkalSjekkes) => {
    const enkeltFakta = avklartefakta.find(fakta => fakta.referanse === STEG.YRKESAKTIVITET);
    if (!enkeltFakta) { return false; }
    return enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  }
}

export default VesentligVirksomhet;
