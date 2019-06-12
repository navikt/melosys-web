import * as MKV from 'melosys-kodeverk';

import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArtikkel16MottaSvar from '../../stegKomponenter/vurderingArtikkel16MottaSvar';
import { hentFakta } from '../../../../regler/avklartefakta';


class Artikkel16MottaSvar extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'Artikkel 16 vedtak',
        exec: () => true,
        nesteSteg: STEG.ARTIKKEL_16_VEDTAK,
      },
    ];
    this.id = STEG.ARTIKKEL_16_MOTTA_SVAR;
    this.tittel = 'Artikkel 16.1 Svar';
    this.komponent = VurderingArtikkel16MottaSvar;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = _propsLight => ({
      svarAnmodningUnntakAvklartfakta: hentFakta(MKV.Koder.avklartefakta.SVAR_ANMODNING_UNNTAK, _propsLight.avklartefakta),
    });
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Artikkel16MottaSvar;
