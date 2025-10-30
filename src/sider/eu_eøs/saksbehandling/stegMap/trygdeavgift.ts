import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { STEG } from "../../../../felleskomponenter/stegvelger";
import { VurderingTrygdeavgift } from "../../stegKomponenter/vurderingTrygdeavgift/vurderingTrygdeavgift";

type TrygdeavgiftHandlers = {
  bekreft?: () => void;
  tilbake?: () => void;
  oppdater?: () => void;
};

export interface TrygdeavgiftPropsLight {
  behandlingID?: number;
  generiskStegRedigerbart?: boolean;
  redigerbart?: boolean;
  tilgjengeligeHandlers?: TrygdeavgiftHandlers;
}

interface TrygdeavgiftTilstand {
  harAvklaring: boolean;
}

type StegInstance = {
  kriterier: Array<{ exec: () => boolean; nesteSteg: string | false }>;
  id: string;
  tittel: string;
  komponent: unknown;
  samleRelevanteData: (propsLight: TrygdeavgiftPropsLight) => Record<string, unknown>;
  beregnRelevantUI: () => TrygdeavgiftTilstand;
  handlers: Record<string, unknown>;
};

const DEFAULT_STATE_KEY = Symbol("trygdeavgift-default-state");
const stegState = new Map<number | symbol, TrygdeavgiftTilstand>();

const resolveStateKey = (behandlingID?: number) =>
  typeof behandlingID === "number" ? behandlingID : DEFAULT_STATE_KEY;

const getState = (behandlingID?: number): TrygdeavgiftTilstand => {
  const stateKey = resolveStateKey(behandlingID);
  const existingState = stegState.get(stateKey);
  if (existingState) {
    return existingState;
  }

  const initialState: TrygdeavgiftTilstand = { harAvklaring: false };
  stegState.set(stateKey, initialState);
  return initialState;
};

const resolveRedigerbart = (propsLight: TrygdeavgiftPropsLight) =>
  typeof propsLight.generiskStegRedigerbart === "boolean" ? propsLight.generiskStegRedigerbart : propsLight.redigerbart;

const STEG_CONST = STEG as Record<string, string | undefined>;
const TRYGD_STEG_ID = STEG_CONST.TRYGDEAVGIFT ?? "TRYGDEAVGIFT";
const NEXT_STEG_ID = STEG_CONST.VEDTAK ?? "VEDTAK";

export default function Trygdeavgift(propsLight: TrygdeavgiftPropsLight, stegPosisjon: number) {
  const steg = new Steg(propsLight, stegPosisjon) as StegInstance;
  const state = getState(propsLight.behandlingID);
  const handlers = propsLight.tilgjengeligeHandlers ?? {};

  const oppdaterStatus = (isValid: boolean) => {
    if (state.harAvklaring === isValid) {
      return;
    }

    state.harAvklaring = isValid;
    handlers.oppdater?.();
  };

  steg.kriterier = [
    {
      exec: () => true,
      nesteSteg: NEXT_STEG_ID,
    },
  ];
  steg.id = TRYGD_STEG_ID;
  steg.tittel = "Trygdeavgift";
  steg.komponent = VurderingTrygdeavgift;
  steg.samleRelevanteData = (_propsLight: TrygdeavgiftPropsLight) => ({
    redigerbart: resolveRedigerbart(_propsLight),
  });
  steg.beregnRelevantUI = () => ({
    harAvklaring: state.harAvklaring,
  });
  steg.handlers = {
    bekreft: handlers.bekreft,
    tilbake: handlers.tilbake,
    oppdaterStatus,
  };

  return steg;
}
