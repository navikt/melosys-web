import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingPeriode from "../../stegKomponenter/vurderingPeriode/vurderingPeriode";
import type { PropsLight } from "../../../../felleskomponenter/stegvelger/stegMotor/typer";

import MKV from "../../../../melosyskodeverk";

// Spesifikke typer for Periode-steg
interface PeriodeRelevanteData {
  [key: string]: unknown; // Index signature for base class compatibility
  redigerbart: boolean;
  lovvalgsbestemmelseSomSkalVises?: string;
  lovvalgsbestemmelseSomSkalLagres?: string;
  aktivtSteg: boolean;
}

interface PeriodeRelevantUI {
  [key: string]: unknown; // Index signature for base class compatibility
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

    const lovvalgsbestemmelseSomSkalLagres = propsLight.lovvalgsbestemmelse;

    const harAvklaring = !!lovvalgsbestemmelseSomSkalLagres;

    this.kriterier = [
      {
        // Bare vis neste steg hvis lovvalgsbestemmelse er satt (periode fullført)
        exec: () => !!this._propsLight.lovvalgsbestemmelse,
        nesteSteg: STEG.VURDERING_TRYGDEAVGIFT,
      },
    ];

    this.id = STEG.VURDERING_PERIODE;
    this.tittel = "Periode";
    this.komponent = VurderingPeriode;
    this.samleRelevanteData = (_propsLight: PropsLight): PeriodeRelevanteData => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
      lovvalgsbestemmelseSomSkalVises,
      lovvalgsbestemmelseSomSkalLagres,
      aktivtSteg: _propsLight.aktivtSteg,
    });
    this.beregnRelevantUI = (): PeriodeRelevantUI => ({
      harAvklaring,
    });
    this.handlers = {
      bekreftOgFortsett: propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      byggLovvalgsperioder: this._propsLight.tilgjengeligeHandlers.byggLovvalgsperioder,
      oppdaterData: (felt: string, verdi: unknown) =>
        this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id!, felt, verdi),
      slettData: (data?: unknown) => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id!, data),
    };
  }
}

export default Periode;
