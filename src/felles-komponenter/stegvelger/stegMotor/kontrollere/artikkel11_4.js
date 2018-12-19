import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArtikkel11_4 from '../../stegKomponenter/vurderingArtikkel11_4';
import { erVilkarOppfylt } from '../../../../regler/vilkar';

import * as Koder from '../../../../koder';

class Artikkel11_4 extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'vilkar for artikkel 11.4.1 (og implissit 11.3A) er oppfylt',
        exec: (avklartefakta, alleVilkar) => erVilkarOppfylt(Koder.FO_883_2004_ART11_4_1, alleVilkar) && erVilkarOppfylt(Koder.FO_883_2004_ART11_3A, alleVilkar),
        nesteSteg: STEG.VEDTAK,
      },
      {
        beskrivelse: 'vilkar for artikkel 11.4.2 er oppfylt',
        exec: (avklartefakta, alleVilkar) => erVilkarOppfylt(Koder.FO_883_2004_ART11_4_2, alleVilkar),
        nesteSteg: STEG.VEDTAK,
      },
      {
        beskrivelse: 'kun vilkår 11.4.1 er foreløpig oppfylt, så gå videre til 12.1-vurdering',
        exec: (avklartefakta, alleVilkar) => erVilkarOppfylt(Koder.FO_883_2004_ART11_4_1, alleVilkar),
        nesteSteg: STEG.YRKESAKTIVITET,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this._id = STEG.ARTIKKEL_11_4;
    this._tittel = 'Vurdering av 11.4';
    this._komponent = VurderingArtikkel11_4;
    this._samleRelevanteData = _propsLight => ({
      artikkel: { kode: Koder.FO_883_2004_ART11_4_2, term: '11.4' },
      bostedsland: _propsLight.bostedsland,
      oppholdsland: _propsLight.oppholdsland,
      valgteArbeidsgivere: _propsLight.valgteArbeidsgivere,
      begrunnelser: _propsLight.begrunnelser.artikkel11_4 || [],
    });

    this._beregnRelevantUI = _propsLight => {
      const {
        art11_3A, art11_4_1, art11_4_2, nis,
      } = _propsLight.skjema.vilkar;

      const visNISAvsnitt = art11_4_1 && art11_3A;

      const harAvklaring = (art11_4_1 && art11_3A && (nis === true || nis === false)) || art11_4_2 || (art11_4_1 && !art11_3A);

      return {
        harAvklaring,
        art11_3A,
        art11_4_1,
        art11_4_2,
        visNISAvsnitt,
      };
    };
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      settSkjemaVerdi: this._propsLight.tilgjengeligeHandlers.settSkjemaVerdi,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Artikkel11_4;
