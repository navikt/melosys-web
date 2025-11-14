import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import { VurderingTrygdeavgift as VurderingTrygdeavgiftFTRL } from "../../../ftrl/saksbehandling/stegKomponenter/vurderingTrygdeavgift/vurderingTrygdeavgift";
import type { PropsLight, StegKriterie } from "../../../../felleskomponenter/stegvelger/stegMotor/typer";

// Spesifikke typer for Trygdeavgift-steg
interface TrygdeavgiftRelevanteData {
  [key: string]: unknown; // Index signature for base class compatibility
  behandlingID?: string;
  redigerbart: boolean;
}

interface TrygdeavgiftRelevantUI {
  [key: string]: unknown; // Index signature for base class compatibility
  harAvklaring: boolean;
}

interface TrygdeavgiftHandlers {
  [key: string]: unknown; // Index signature for base class compatibility
  bekreft: () => void;
  tilbake: () => void;
  oppdaterData: (felt: string, verdi: unknown) => void;
  slettData: (data?: unknown) => void;
  oppdaterStatus: () => void;
}

class Trygdeavgift extends Steg {
  constructor(propsLight: PropsLight, stegPosisjon: number) {
    super(propsLight, stegPosisjon);

    this.kriterier = [
      {
        exec: () => true,
        nesteSteg: STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK,
      },
    ];

    this.id = STEG.VURDERING_TRYGDEAVGIFT;
    this.tittel = "Trygdeavgift";
    this.komponent = VurderingTrygdeavgiftFTRL;

    this.samleRelevanteData = (_propsLight: PropsLight): TrygdeavgiftRelevanteData => ({
      behandlingID: _propsLight.behandlingID,
      redigerbart: _propsLight.generiskStegRedigerbart,
    });

    this.beregnRelevantUI = (): TrygdeavgiftRelevantUI => ({
      harAvklaring: true,
    });

    this.handlers = {
      bekreft: propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      oppdaterData: (felt: string, verdi: unknown) =>
        this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id!, felt, verdi),
      slettData: (data?: unknown) => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id!, data),
      oppdaterStatus: () => {}, // No-op: Step validity is managed internally by the component
    };

    this.status = FANE_STATUS.OK;
  }
}

export default Trygdeavgift;
