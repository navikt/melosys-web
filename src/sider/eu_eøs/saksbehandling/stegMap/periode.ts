import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingPeriode from "../../stegKomponenter/vurderingPeriode/vurderingPeriode";
import type { PropsLight, StegKriterie } from "../../../../felleskomponenter/stegvelger/stegMotor/typer";

import MKV from "../../../../melosyskodeverk";

// Spesifikke typer for Periode-steg
interface PeriodeRelevanteData {
  redigerbart: boolean;
  lovvalgsbestemmelseSomSkalVises?: string;
  lovvalgsbestemmelseSomSkalLagres?: string;
  aktivtSteg: boolean;
}

interface PeriodeRelevantUI {
  harAvklaring: boolean;
}

interface PeriodeHandlers {
  bekreftOgFortsett: () => void;
  tilbake: () => void;
  byggLovvalgsperioder: () => void;
  oppdaterData: (felt: string, verdi: unknown) => void;
  slettData: (data?: unknown) => void;
}

// Type helper for accessing Steg properties (base class is JS with getters/setters)
interface StegWithTypes {
  _propsLight: PropsLight;
  id: string;
  tittel: string;
  komponent: typeof VurderingPeriode;
  kriterier: StegKriterie[];
  samleRelevanteData: (propsLight: PropsLight) => PeriodeRelevanteData;
  beregnRelevantUI: () => PeriodeRelevantUI;
  handlers: PeriodeHandlers;
  status: string;
}

class Periode extends Steg {
  constructor(propsLight: PropsLight, stegPosisjon: number) {
    super(propsLight, stegPosisjon);

    const self = this as unknown as StegWithTypes;

    const lovvalgsbestemmelseSomSkalVises =
      propsLight.lovvalgsbestemmelse ===
      MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A
        ? MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5
        : propsLight.lovvalgsbestemmelse;

    const lovvalgsbestemmelseSomSkalLagres = propsLight.lovvalgsbestemmelse;

    self.kriterier = [
      {
        exec: () => true, // Alltid gå videre til vedtak
        nesteSteg: STEG.VURDERING_TRYGDEAVGIFT,
      },
    ];

    const harAvklaring = !!lovvalgsbestemmelseSomSkalLagres;

    self.id = STEG.VURDERING_PERIODE;
    self.tittel = "Periode";
    self.komponent = VurderingPeriode;
    self.samleRelevanteData = (_propsLight: PropsLight) => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
      lovvalgsbestemmelseSomSkalVises,
      lovvalgsbestemmelseSomSkalLagres,
      aktivtSteg: _propsLight.aktivtSteg,
    });
    self.beregnRelevantUI = () => ({
      harAvklaring,
    });
    self.handlers = {
      bekreftOgFortsett: propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      byggLovvalgsperioder: self._propsLight.tilgjengeligeHandlers.byggLovvalgsperioder,
      oppdaterData: (felt: string, verdi: unknown) =>
        self._propsLight.tilgjengeligeHandlers.oppdaterStegData(self.id, felt, verdi),
      slettData: (data?: unknown) => self._propsLight.tilgjengeligeHandlers.slettStegData(self.id, data),
    };
    self.status = FANE_STATUS.OK;
  }
}

export default Periode;
