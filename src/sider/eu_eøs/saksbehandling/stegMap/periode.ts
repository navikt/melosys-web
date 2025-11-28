import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingPeriode from "../../stegKomponenter/vurderingPeriode/vurderingPeriode";
import type { PropsLight } from "../../../../felleskomponenter/stegvelger/stegMotor/typer";

import MKV from "../../../../melosyskodeverk";

interface PeriodeRelevanteData {
  [key: string]: unknown;
  redigerbart: boolean;
  lovvalgsbestemmelseSomSkalVises?: string;
  lovvalgsbestemmelseSomSkalLagres?: string;
  aktivtSteg: boolean | undefined;
}

interface PeriodeRelevantUI {
  [key: string]: unknown;
  harAvklaring: boolean;
}

class Periode extends Steg {
  constructor(propsLight: PropsLight, stegPosisjon: number) {
    super(propsLight, stegPosisjon);

    const lovvalgsbestemmelseSomSkalVises =
      propsLight.lovvalgsbestemmelse ===
      MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A
        ? MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5
        : propsLight.lovvalgsbestemmelse;

    this.kriterier = [
      {
        exec: () => this.formIsValid,
        nesteSteg: STEG.VURDERING_TRYGDEAVGIFT,
      },
    ];

    this.id = STEG.VURDERING_PERIODE;
    this.tittel = "Periode";
    this.komponent = VurderingPeriode;
    this.samleRelevanteData = (_propsLight: PropsLight = this._propsLight): PeriodeRelevanteData => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
      lovvalgsbestemmelseSomSkalVises,
      lovvalgsbestemmelseSomSkalLagres: _propsLight.lovvalgsbestemmelse,
      aktivtSteg: _propsLight.aktivtSteg,
    });
    this.beregnRelevantUI = (_propsLight: PropsLight = this._propsLight): PeriodeRelevantUI => ({
      harAvklaring: !!_propsLight.lovvalgsbestemmelse,
    });
    this.handlers = {
      bekreftOgFortsett: propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      byggLovvalgsperioder: this._propsLight.tilgjengeligeHandlers.byggLovvalgsperioder,
      oppdaterData: (felt: string, verdi: unknown) =>
        this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id!, felt, verdi),
      slettData: (data?: unknown) => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id!, data),
      oppdaterStatus: (stegErGyldig: boolean) => propsLight.tilgjengeligeHandlers.oppdaterStatus(stegErGyldig),
    };
    this.status = FANE_STATUS.OK;
  }
}

export default Periode;
