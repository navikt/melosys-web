import * as MKV from 'melosys-kodeverk';
import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingNormaltDriverVirksomhet from '../../stegKomponenter/vurderingNormaltDriverVirksomhet';
import { erVilkarOppfylt, hentVilkar } from '../../../../../../regler/vilkar';

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
    this.tittel = 'Vanligvis drift i Norge?';
    this.komponent = VurderingNormaltDriverVirksomhet;
    this.samleRelevanteData = _propsLight => ({
      valgteVirksomheter: _propsLight.valgteVirksomheter,
      begrunnelser: _propsLight.begrunnelser.art12_2_normalt_virksomhet,
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const normaltDriverVirksomhet = hentVilkar(MKV.Koder.vilkaar.ART12_2_NORMALT_DRIVER_VIRKSOMHET, _propsLight.vilkar);
      const harAvklaring = normaltDriverVirksomhet.oppfylt === true ||
                           (normaltDriverVirksomhet.oppfylt === false && normaltDriverVirksomhet.begrunnelseKoder.length > 0);
      return {
        visBegrunnelser: !normaltDriverVirksomhet.oppfylt,
        harAvklaring,
        normaltDriverVirksomhet,
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

export default NormaltDriverVirksomhet;
