import MKV from "../../../../melosyskodeverk";

import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/stegLegacy";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingEndrePeriode from "../../stegKomponenter/vurderingEndrePeriode/vurderingEndrePeriode";
import { hentFakta } from "../../../../domeneUtils";

class EndrePeriode extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        exec: () => true,
        nesteSteg: false,
      },
    ];
    this.id = STEG.ENDRET_PERIODE;
    this.tittel = "Endre lovvalgsperiode";
    this.komponent = VurderingEndrePeriode;
    this.samleRelevanteData = (_propsLight) => ({ behandlingID: _propsLight.behandlingID }); // TODO; Refactor with React Context API!!!
    this.beregnRelevantUI = (_propsLight) => ({
      aarsakEndringPeriodeAvklartfakta: hentFakta(
        MKV.Koder.avklartefaktatyper.AARSAK_ENDRING_PERIODE,
        _propsLight.avklartefakta,
      ),
    });
    this.handlers = {
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      endreLovvalgsperioderHandler: this._propsLight.tilgjengeligeHandlers.endreLovvalgsperioderHandler,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: (data) => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this.status = FANE_STATUS.OK;
  }
}

export default EndrePeriode;
