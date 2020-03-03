import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingVurderarbeidsland from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingVurderarbeidsland';
import Yrkesgruppe from './yrkesgruppe';

import * as KV from '../../../kodeverk';
import { hentFakta, hentFaktaListe } from '../../../regler/avklartefakta';

class Vurderarbeidsland extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const sokkelEllerSkipListe = hentFaktaListe(KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP, propsLight.avklartefakta);
    const installasjonArbeidslandListe = hentFaktaListe(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND, propsLight.avklartefakta);

    this.kriterier = [
      {
        exec: () => {
          return false;
        },
        nesteSteg: STEG.VURDER_ARBEIDSLAND,
      },
    ];
    this.id = STEG.VURDER_ARBEIDSLAND;
    this.tittel = 'Vurder arbeidsland';
    this.komponent = VurderingVurderarbeidsland;
    this.samleRelevanteData = _propsLight => ({
      begrunnelser: _propsLight.begrunnelser.sokkel,
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const installasjonArbeidslandTypeListe = hentFaktaListe(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND_TYPE, _propsLight.avklartefakta);

      return ({
        harAvklaring: false,
        sokkelEllerSkipListe,
        installasjonArbeidslandListe,
        installasjonArbeidslandTypeListe,
      });
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this.status = FANE_STATUS.OK;
  }
}

export default Vurderarbeidsland;
