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
        exec: () => Artikkel16MottaSvar.finnAvklaring(propsLight.anmodningsperiodesvar),
        nesteSteg: STEG.ARTIKKEL_16_VEDTAK,
      },
      {
        beskrivelse: 'alle valg',
        exec: () => true,
        nesteSteg: null,
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
      harAvklaring: Artikkel16MottaSvar.finnAvklaring(_propsLight.anmodningsperiodesvar),
    });
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this._status = FANE_STATUS.OK;
  }

  static finnAvklaring = anmodningsperiodesvar => {
    const { endretPeriode, anmodningsperiodeSvarType } = anmodningsperiodesvar;

    if (!anmodningsperiodeSvarType) return false;
    if (anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE) {
      if (!endretPeriode.fom || !endretPeriode.tom) return false;
    }

    return true;
  }
}

export default Artikkel16MottaSvar;
