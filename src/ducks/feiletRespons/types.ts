import { ErrorResponse } from "melosys-api";

import { utpekTypes } from "../utpek";
import { vedtakTypes } from "../vedtak";
import { videresendingTypes } from "../videresending";
import { anmodningunntakTypes } from "../anmodningunntak";
import { kontrollTypes } from "../kontroll";
import { fagsakTypes } from "../fagsaker";
import { trygdeavgiftTypes } from "../trygdeavgift";

export const RESET = "feiletRespons/RESET";

interface ResetAction {
  type: typeof RESET;
}
export interface Data {
  data?: ErrorResponse;
}

export type Action =
  | utpekTypes.Action
  | vedtakTypes.Action
  | kontrollTypes.Action
  | videresendingTypes.Action
  | anmodningunntakTypes.Action
  | fagsakTypes.Action
  | trygdeavgiftTypes.Action
  | ResetAction;
