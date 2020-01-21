import * as KV from '../../../../../../kodeverk';
import * as Utils from '../../../../../../utils';

import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArtikkel13_2b from '../../stegKomponenter/vurderingArtikkel13_2b';
import { hentFakta, hentFaktaVerdi } from '../../../../../../regler/avklartefakta';

class Artikkel13_2_b extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this.id = STEG.ARTIKKEL_13_2_B;
    this.tittel = 'Vurdering av 13.2 b';
    this.komponent = VurderingArtikkel13_2b;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const interessesenterFakta = Artikkel13_2_b.hentInteressesenterFakta(_propsLight.avklartefakta);

      return {
        harAvklaring: Artikkel13_2_b.harAvklaring(_propsLight.avklartefakta),
        interessesenterFakta,
      };
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this._status = FANE_STATUS.OK;
  }

  static hentInteressesenterFakta = avklarteFakta => {
    return hentFakta(KV.Koder.avklartefaktaKoder.INTERESSESENTER, avklarteFakta);
  };

  static harAvklaring = avklarteFakta => {
    const interessesenterFakta = Artikkel13_2_b.hentInteressesenterFakta(avklarteFakta);
    const interessesenter = hentFaktaVerdi(interessesenterFakta);

    return !(Utils._isNil(interessesenter) || interessesenter === '');
  };
}

export default Artikkel13_2_b;
