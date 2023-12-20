import * as QS from "qs";
import { getAsJson, postAsJson, deleteAsJson } from "../../utils";
import { API_BASE_URL, FAGSAKER } from "../../api-constants";

export interface Aktoer {
  databaseID?: number;
  aktoerID?: string | null;
  institusjonsID?: string | null;
  orgnr?: string | null;
  rolleKode: string;
  utenlandskPersonID?: string | null;
  personIdent?: string | null;
  fullmakter?: string[] | null;
}

export const hent = (saksnr: string, rolleKode: string): Promise<Aktoer[]> => {
  const URI_PATH = `${API_BASE_URL}${FAGSAKER}/${saksnr}/aktoerer`;
  const qs = QS.stringify({ rolleKode });

  const URI_AKTOER = qs ? `${URI_PATH}/?${qs}` : URI_PATH;
  return getAsJson(URI_AKTOER);
};

type UlagretAktoer = Omit<Aktoer, "databaseID"> & {
  databaseID?: number | null;
};

export const send = (saksnr: string, data: UlagretAktoer): Promise<Aktoer> =>
  postAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnr}/aktoerer`, data);

export const slett = (databaseid: number) => deleteAsJson(`${API_BASE_URL}${FAGSAKER}/aktoerer/${databaseid}`);
