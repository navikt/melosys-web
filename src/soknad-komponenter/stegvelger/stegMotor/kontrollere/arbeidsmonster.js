import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import * as KV from '../../../../kodeverk';
import * as Utils from '../../../../utils';

import { hentFakta, hentFaktaListe, hentFaktaVerdi } from '../../../../regler/avklartefakta';
import VurderingArbeidsmonster from '../../stegKomponenter/vurderingArbeidsmonster';

class Arbeidsmonster extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'Stopp steg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this.id = STEG.ARBEIDSMONSTER;
    this.tittel = 'Arbeids\u00ADmønster';
    this.komponent = VurderingArbeidsmonster;
    this.samleRelevanteData = _propsLight => ({
      arbeidsland: _propsLight.arbeidsland,
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const marginaltArbeid = hentFaktaListe(KV.Koder.avklartefaktaKoder.MARGINALT_ARBEID, _propsLight.avklartefakta);
      const aktivitetINorge = hentFakta(KV.Koder.avklartefaktaKoder.AKTIVITET_I_NORGE, _propsLight.avklartefakta);

      const harAvklaring = !Utils._isNil(hentFaktaVerdi(aktivitetINorge));

      return ({
        harAvklaring,
        marginaltArbeid,
        aktivitetINorge,
      });
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettAllDataForSteg: () => this._propsLight.tilgjengeligeHandlers.slettAllDataForSteg(this.id),
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Arbeidsmonster;
