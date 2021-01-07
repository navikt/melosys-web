import { getAsJson } from "../utils";
import { API_BASE_URL, STATISTIKK } from "../api-constants";

interface StatistikkResDto {
  aapneBehandlinger: {
    [index: string]: number;
  };
}

export const hent = (): Promise<StatistikkResDto> => getAsJson(`${API_BASE_URL}${STATISTIKK}`);
