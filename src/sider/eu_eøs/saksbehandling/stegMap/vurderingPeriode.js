import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingPeriodeOffentligAnsattKomponent from "../../stegKomponenter/vurderingPeriodeOffentligAnsatt/vurderingPeriodeOffentligAnsatt";

import MKV from "../../../../melosyskodeverk";

class VurderingPeriodeOffentligAnsattSteg extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const lovvalgsbestemmelseSomSkalVises =
      propsLight.lovvalgsbestemmelse ===
      MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A
        ? MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5
        : propsLight.lovvalgsbestemmelse;

    const lovvalgsbestemmelseSomSkalLagres = propsLight.lovvalgsbestemmelse;

    this.kriterier = [
      {
        exec: () => true, // Alltid gå videre til trygdeavgift
        nesteSteg: STEG.TRYGDEAVGIFT,
      },
    ];

    this.id = STEG.VURDERING_PERIODE;
    this.tittel = "Periode";
    this.komponent = VurderingPeriodeOffentligAnsattKomponent;
    this.samleRelevanteData = (_propsLight) => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
      lovvalgsbestemmelseSomSkalVises,
      lovvalgsbestemmelseSomSkalLagres,
    });
    this.beregnRelevantUI = (_propsLight) => ({
      harAvklaring: VurderingPeriodeOffentligAnsattSteg.harAvklaring(_propsLight),
    });
    this.handlers = {
      bekreftOgFortsett: propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      byggLovvalgsperioder: this._propsLight.tilgjengeligeHandlers.byggLovvalgsperioder,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: (data) => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this._status = FANE_STATUS.OK;
  }

  static harAvklaring(propsLight) {
    // Steget er fullført når lovvalgsbestemmelse er satt
    return !!propsLight.lovvalgsbestemmelse;
  }
}

export default VurderingPeriodeOffentligAnsattSteg;
