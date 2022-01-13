import { getAsJson, putAsText } from "../../../utils";
import { API_BASE_URL, BEHANDLINGER } from "../../../api-constants";

import { BehandlingResDto } from "./types";

export const hentBehandling = (behandlingID: number): Promise<BehandlingResDto> =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}`);

export const ferdigbehandleNyVurdering = (behandlingID: number) =>
  putAsText(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/avslutt-uten-endring`);
