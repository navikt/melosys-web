import { getAsJson, putAsText } from "../../../utils";
import { API_BASE_URL, BEHANDLINGER } from "../../../api-constants";

import { BehandlingResDto } from "./types";

export const hentBehandling = (behandlingID: number): Promise<BehandlingResDto> =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}`);

export const avsluttBehandlingUtenEndring = (behandlingID: number) =>
  putAsText(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/avsluttBehandling`);
