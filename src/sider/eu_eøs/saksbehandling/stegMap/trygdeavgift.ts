import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import { VurderingTrygdeavgift as VurderingTrygdeavgiftFTRL } from "../../../ftrl/saksbehandling/stegKomponenter/vurderingTrygdeavgift/vurderingTrygdeavgift";
import type { PropsLight, StegKriterie } from "../../../../felleskomponenter/stegvelger/stegMotor/typer";

// Spesifikke typer for Trygdeavgift-steg
interface TrygdeavgiftRelevanteData {
  behandlingID?: string;
  redigerbart: boolean;
}

interface TrygdeavgiftRelevantUI {
  harAvklaring: boolean;
}

interface TrygdeavgiftHandlers {
  bekreft: () => void;
  tilbake: () => void;
  oppdaterData: (felt: string, verdi: unknown) => void;
  slettData: (data?: unknown) => void;
  oppdaterStatus: () => void;
}

// Type helper for accessing Steg properties (base class is JS with getters/setters)
interface StegWithTypes {
  _propsLight: PropsLight;
  id: string;
  tittel: string;
  komponent: typeof VurderingTrygdeavgiftFTRL;
  kriterier: StegKriterie[];
  samleRelevanteData: (propsLight: PropsLight) => TrygdeavgiftRelevanteData;
  beregnRelevantUI: () => TrygdeavgiftRelevantUI;
  handlers: TrygdeavgiftHandlers;
  status: string;
}

class Trygdeavgift extends Steg {
  constructor(propsLight: PropsLight, stegPosisjon: number) {
    super(propsLight, stegPosisjon);

    const self = this as unknown as StegWithTypes;

    self.kriterier = [
      {
        exec: () => true,
        nesteSteg: STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK,
      },
    ];

    self.id = STEG.VURDERING_TRYGDEAVGIFT;
    self.tittel = "Trygdeavgift";
    self.komponent = VurderingTrygdeavgiftFTRL;

    self.samleRelevanteData = (_propsLight: PropsLight) => ({
      behandlingID: _propsLight.behandlingID,
      redigerbart: _propsLight.generiskStegRedigerbart,
    });

    self.beregnRelevantUI = () => ({
      harAvklaring: true,
    });

    self.handlers = {
      bekreft: propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      oppdaterData: (felt: string, verdi: unknown) =>
        self._propsLight.tilgjengeligeHandlers.oppdaterStegData(self.id, felt, verdi),
      slettData: (data?: unknown) => self._propsLight.tilgjengeligeHandlers.slettStegData(self.id, data),
      oppdaterStatus: () => {}, // No-op: Step validity is managed internally by the component
    };

    self.status = FANE_STATUS.OK;
  }
}

export default Trygdeavgift;
