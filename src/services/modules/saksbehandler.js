import { getAsJson } from "../utils";
import { API_BASE_URL, SAKSBEHANDLER } from "../api-constants";

export const hent = () => getAsJson(`${API_BASE_URL}${SAKSBEHANDLER}`);
