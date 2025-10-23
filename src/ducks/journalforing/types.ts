import { ErrorResponse } from "melosys-api";
import { KTObject } from "@navikt/melosys-kodeverk";
import { BehandlingOversikt } from "../../services/modules/types/fagsak";

export const OK = "journalforing/OK";
export const FEILET = "journalforing/FEILET";
export const PENDING = "journalforing/PENDING";
export const RESET = "journalforing/RESET";

export interface Sak {
  saksnummer: string;
  sakstype: KTObject;
  sakstema: KTObject;
  saksstatus: KTObject;
  behandlingOversikter: BehandlingOversikt[];
}

export interface FeltNavn {
  formNavn: string;
  opprettBehandling: string;
  behandlingstema: string;
  behandlingstype: string;
  hovedpart: string;
}

export interface Data {
  data?: ErrorResponse;
}

interface ResetAction {
  type: typeof RESET;
}

interface FeiletAction {
  type: typeof FEILET;
  data: any;
}

interface PendingAction {
  type: typeof PENDING;
}

interface OkAction {
  type: typeof OK;
  data: any;
}

export type Action = ResetAction | FeiletAction | PendingAction | OkAction;
