import * as KV from '../../../kodeverk';
import * as Utils from '../../../utils';

import MKV from '../../../melosyskodeverk';

import Steg from '../komponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../komponenter/stegvelger/stegMotor/typer';
import VurderingArtikkel13_2b from '../komponenter/stegvelger/stegKomponenter/vurderingArtikkel13_2b';
import { hentFakta, hentFaktaVerdi } from '../../../regler/avklartefakta';

class Artikkel13_2_b extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    const harAvklaring = Artikkel13_2_b.harAvklaring(propsLight.avklartefakta);
    const omfattetILandFakta = hentFakta(KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND, propsLight.avklartefakta);
    const omfattetILandFaktaVerdi = hentFaktaVerdi(omfattetILandFakta);
    const erOmfattetILandIkkeNorge = omfattetILandFaktaVerdi && omfattetILandFaktaVerdi !== MKV.Koder.landkoder.NO;
    const erOmfattetINorge = omfattetILandFaktaVerdi && omfattetILandFaktaVerdi === MKV.Koder.landkoder.NO;

    this.kriterier = [
      {
        beskrivelse: '',
        exec: () => harAvklaring && erOmfattetINorge,
        nesteSteg: STEG.ARTIKKEL_13_2_B_NORGE,
      },
      {
        beskrivelse: '',
        exec: () => harAvklaring && erOmfattetILandIkkeNorge,
        nesteSteg: STEG.ARTIKKEL_13_2_B_UTPEK_LAND,
      },
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
      const omfattesILandFakta = Artikkel13_2_b.hentOmfattesILandFakta(_propsLight.avklartefakta);

      return {
        harAvklaring: Artikkel13_2_b.harAvklaring(_propsLight.avklartefakta),
        omfattesILandFakta,
      };
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this._status = FANE_STATUS.OK;
  }

  static hentOmfattesILandFakta = avklarteFakta => hentFakta(KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND, avklarteFakta);

  static harAvklaring = avklarteFakta => {
    const omfattesILandFakta = Artikkel13_2_b.hentOmfattesILandFakta(avklarteFakta);
    const omfattesILand = hentFaktaVerdi(omfattesILandFakta);

    return !(Utils._isNil(omfattesILand) || omfattesILand === '');
  };
}

export default Artikkel13_2_b;
