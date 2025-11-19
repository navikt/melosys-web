import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { STEG } from "../../../../felleskomponenter/stegvelger";
import { VurderingTrygdeavgift as VurderingTrygdeavgiftFTRL } from "../../../../felleskomponenter/trygdeavgift/vurderingTrygdeavgift/vurderingTrygdeavgift";
import type { PropsLight } from "../../../../felleskomponenter/stegvelger/stegMotor/typer";
import { lagTrygdeavgiftStatus } from "../../../../felleskomponenter/stegvelger";

// Spesifikke typer for Trygdeavgift-steg
interface TrygdeavgiftRelevanteData {
  [key: string]: unknown; // Index signature for base class compatibility
}

interface TrygdeavgiftRelevantUI {
  [key: string]: unknown; // Index signature for base class compatibility
  harAvklaring: boolean;
}

class Trygdeavgift extends Steg {
  private _sisteStatus: boolean | undefined = undefined;

  constructor(propsLight: PropsLight, stegPosisjon: number) {
    super(propsLight, stegPosisjon);

    this.kriterier = [
      {
        exec: () => !!this._propsLight.trygdeavgiftStatus,
        nesteSteg: STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK,
      },
    ];

    this.id = STEG.VURDERING_TRYGDEAVGIFT;
    this.tittel = "Trygdeavgift";
    this.komponent = VurderingTrygdeavgiftFTRL;

    this.samleRelevanteData = (_propsLight: PropsLight): TrygdeavgiftRelevanteData => {
      // Komponenten henter behandlingID og redigerbart fra Redux, ikke fra props
      return {};
    };

    this.beregnRelevantUI = (_propsLight: PropsLight): TrygdeavgiftRelevantUI => {
      // Sjekk om trygdeavgift-status er satt via oppdaterStatus
      const trygdeavgiftStatus = _propsLight.trygdeavgiftStatus;
      return {
        harAvklaring: trygdeavgiftStatus !== undefined ? trygdeavgiftStatus : true,
      };
    };

    this.handlers = {
      bekreft: propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      oppdaterData: (felt: string, verdi: unknown) =>
        this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id!, felt, verdi),
      slettData: (data?: unknown) => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id!, data),
      // Lagre valideringsstatus når komponenten kaller oppdaterStatus
      // Kun oppdater hvis verdien faktisk har endret seg for å unngå unødvendige re-renders
      oppdaterStatus: (isValid: boolean) => {
        if (this._sisteStatus !== isValid) {
          this._sisteStatus = isValid;
          this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id!, lagTrygdeavgiftStatus(isValid));
        }
      },
    };
    // Status beregnes dynamisk av hentStatus() basert på harAvklaring
  }
}

export default Trygdeavgift;
