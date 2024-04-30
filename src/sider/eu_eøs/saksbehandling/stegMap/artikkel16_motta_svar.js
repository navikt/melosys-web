import * as Utils from "../../../../utils";

import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingArtikkel16MottaSvar from "../../stegKomponenter/vurderingArtikkel16MottaSvar/vurderingArtikkel16MottaSvar";
import vurderingArtikkel16MottaSvarSchema from "../../stegKomponenter/vurderingArtikkel16MottaSvar/vurderingArtikkel16MottaSvarSchema";
import { lagYupToReduxformErrorMapper } from "../../../../yup";

class Artikkel16MottaSvar extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const harAvklaring = Artikkel16MottaSvar.finnAvklaring(
      propsLight.anmodningsperiodesvarForm,
      propsLight.soknadsperiode
    );

    this.kriterier = [
      {
        exec: () => harAvklaring,
        nesteSteg: STEG.ARTIKKEL_16_VEDTAK,
      },
    ];
    this.id = STEG.ARTIKKEL_16_MOTTA_SVAR;
    this.tittel = "Artikkel 16.1 Svar";
    this.komponent = VurderingArtikkel16MottaSvar;
    this.samleRelevanteData = (_propsLight) => ({
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = (_propsLight) => ({
      harAvklaring,
    });
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: (data) => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this._status = FANE_STATUS.OK;
  }

  static finnAvklaring = (anmodningsperiodesvar, soknadsperiode) => {
    const { endretPeriode, anmodningsperiodeSvarType } = anmodningsperiodesvar;

    if (!anmodningsperiodeSvarType) return false;

    const ugyldigeFelter = lagYupToReduxformErrorMapper(vurderingArtikkel16MottaSvarSchema, {
      context: {
        anmodningsperiodeSvarType,
        soknadsperiode,
      },
    })({ endretPeriode });
    if (!Utils._isEmpty(ugyldigeFelter)) return false;

    return true;
  };
}

export default Artikkel16MottaSvar;
