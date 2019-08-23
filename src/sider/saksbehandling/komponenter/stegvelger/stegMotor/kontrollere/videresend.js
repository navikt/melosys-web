import * as MKV from 'melosys-kodeverk';

import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingVideresend from '../../stegKomponenter/vurderingVideresend';
import { hentFakta } from '../../../../../../regler/avklartefakta';

class Videresend extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: '',
        exec: () => true,
        nesteSteg: null,
      },
    ];

    this.id = STEG.VIDERESEND;
    this.tittel = 'Videresending av søknad';
    this.komponent = VurderingVideresend;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = _propsLight => ({
      bostedslandFakta: hentFakta(MKV.Koder.avklartefakta.IKKE_BOSATT_NORGE, _propsLight.avklartefakta),
    });
    this.handlers = {
      lagreAvklartefakta: this._propsLight.tilgjengeligeHandlers.lagreAvklartefakta,
      lagreAvklartefaktaOgVideresendSoknad: this._propsLight.tilgjengeligeHandlers.lagreAvklartefaktaOgVideresendSoknad,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this.status = FANE_STATUS.OK;
  }
}

export default Videresend;
