import { ErrorResponse } from "melosys-api";

import { utpekTypes } from "../utpek";
import { vedtakTypes } from "../vedtak";
import { videresendingTypes } from "../videresending";
import { anmodningunntakTypes } from "../anmodningunntak";

export interface Data {
  data?: ErrorResponse;
}

export type Action = utpekTypes.Action | vedtakTypes.Action | videresendingTypes.Action | anmodningunntakTypes.Action;
