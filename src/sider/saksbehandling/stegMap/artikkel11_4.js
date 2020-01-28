import MKV from '../../../melosyskodeverk';
import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingArtikkel11_4 from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingArtikkel11_4';
import { erVilkarOppfylt, hentVilkar } from '../../../regler/vilkar';

class Artikkel11_4 extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'vilkar for artikkel 11.4.1 (og implissit 11.3A) er oppfylt',
        exec: (avklartefakta, alleVilkar) =>
          erVilkarOppfylt(MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_4_1, alleVilkar) &&
          erVilkarOppfylt(MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A, alleVilkar),
        nesteSteg: STEG.VEDTAK,
      },
      {
        beskrivelse: 'vilkar for artikkel 11.4.2 er oppfylt',
        exec: (avklartefakta, alleVilkar) => erVilkarOppfylt(MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_4_2, alleVilkar),
        nesteSteg: STEG.VEDTAK,
      },
      {
        beskrivelse: 'kun vilkår 11.4.1 er foreløpig oppfylt, så gå videre til 12.1-vurdering',
        exec: (avklartefakta, alleVilkar) => erVilkarOppfylt(MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_4_1, alleVilkar),
        nesteSteg: STEG.YRKESAKTIVITET,
      },
    ];
    this.id = STEG.ARTIKKEL_11_4;
    this.tittel = 'Vurdering av 11.4';
    this.komponent = VurderingArtikkel11_4;
    this.samleRelevanteData = _propsLight => ({
      artikkel: { kode: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_4_2, term: '11.4' },
      bostedsland: _propsLight.bostedsland,
      arbeidsland: _propsLight.arbeidsland,
      valgteVirksomheter: _propsLight.valgteVirksomheter,
      begrunnelser: _propsLight.begrunnelser.art11_4_begrunnelser || [],
      redigerbart: _propsLight.generiskStegRedigerbart,
    });

    this.beregnRelevantUI = _propsLight => {
      const art11_3A = hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART11_3A, _propsLight.vilkar);
      const art11_4_1 = hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART11_4_1, _propsLight.vilkar);
      const art11_4_2 = hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART11_4_2, _propsLight.vilkar);
      const nis = hentVilkar(MKV.Koder.vilkaar.FTRL_2_12_UNNTAK_TURISTSKIP, _propsLight.vilkar);

      const visNISAvsnitt = art11_4_1.oppfylt && art11_3A.oppfylt;

      const harAvklaring = (art11_4_1.oppfylt && art11_3A.oppfylt && (nis.oppfylt || nis.oppfylt === false)) || art11_4_2.oppfylt || (art11_4_1.oppfylt && !art11_3A.oppfylt);

      return {
        harAvklaring,
        art11_3A,
        art11_4_1,
        art11_4_2,
        nis,
        visNISAvsnitt,
      };
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Artikkel11_4;
