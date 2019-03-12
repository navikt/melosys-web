import * as MKV from 'melosys-kodeverk';
import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArtikkel12_1 from '../../stegKomponenter/vurderingArtikkel12_1';
import { erVilkarOppfylt } from '../../../../regler/vilkar';


class Artikkel12_1 extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'vilkar for artikkel 12.1 er oppfylt',
        exec: (avklartefakta, alleVilkar) => erVilkarOppfylt(MKV.Koder.vilkaar.FO_883_2004_ART12_1, alleVilkar),
        nesteSteg: STEG.VEDTAK,
      },
      {
        beskrivelse: 'ønsker å vurdere 16.1',
        exec: (avklartefakta, alleVilkar) => erVilkarOppfylt(MKV.Koder.vilkaar.FO_883_2004_ART16_1, alleVilkar),
        nesteSteg: STEG.ARTIKKEL_16,
      },
      {
        beskrivelse: 'avslår søknad',
        exec: (avklartefakta, alleVilkar) => (
          erVilkarOppfylt(MKV.Koder.vilkaar.FO_883_2004_ART12_1, alleVilkar) !== undefined
          && erVilkarOppfylt(MKV.Koder.vilkaar.FO_883_2004_ART16_1, alleVilkar) !== undefined
        ),
        nesteSteg: STEG.AVSLAG_12_X_OG_16,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this.id = STEG.ARTIKKEL_12_1;
    this.tittel = 'Vurdering av 12.1';
    this.komponent = VurderingArtikkel12_1;
    this.samleRelevanteData = _propsLight => ({
      artikkel: { kode: MKV.Koder.vilkaar.FO_883_2004_ART12_1, term: '12.1' },
      begrunnelser: _propsLight.begrunnelser.art12_1_begrunnelser || [],
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const {
        art12_1, art12_1_begrunnelser = [],
        art16_1, art16_1_begrunnelser = [], art16_1_begrunnelser_fritekst = '',
      } = _propsLight.skjema.vilkar;

      const harAvklaring = (art12_1 !== null && art12_1 !== undefined) || (art16_1 !== null && art16_1 !== undefined);
      const manglerBegrunnelse12 = art12_1 === false && art12_1_begrunnelser.length === 0;
      const manglerBegrunnelse16 = art16_1 === false && art16_1_begrunnelser.length === 0 && art16_1_begrunnelser_fritekst.length < 1;

      return {
        harAvklaring: harAvklaring && !manglerBegrunnelse12 && !manglerBegrunnelse16,
        visBegrunnelser12: art12_1 === false,
        visBegrunnelser16: art16_1 === false,
        art12_1,
        art16_1,
      };
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      settSkjemaVerdi: this._propsLight.tilgjengeligeHandlers.settSkjemaVerdi,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Artikkel12_1;
