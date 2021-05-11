import * as QS from "qs";
import { getAsJson, postAsJson, deleteAsJson } from "../../utils";
import { API_BASE_URL, FAGSAKER } from "../../api-constants";

export interface HentAktoer {
  databaseID: number;
  aktoerID: string | null;
  institusjonsID: string | null;
  orgnr: string | null;
  rolleKode: string;
  utenlandskPersonID: string | null;
  representererKode: string | null;
}

export type HentResDto = HentAktoer[];

export const hent = (saksnr: string, rolleKode: string, representererKode?: string): Promise<HentResDto> => {
  const URI_PATH = `${API_BASE_URL}${FAGSAKER}/${saksnr}/aktoerer`;
  const qs = QS.stringify({ rolleKode, representererKode });

  const URI_AKTOER = qs ? `${URI_PATH}/?${qs}` : URI_PATH;
  return getAsJson(URI_AKTOER);
};

interface SendAktoer {
  databaseID: number | null;
  aktoerID: string | null;
  institusjonsID: string | null;
  orgnr: string | null;
  rolleKode: string;
  utenlandskPersonID: string | null;
  representererKode: string | null;
}

type SendReqDto = SendAktoer;

export const send = (saksnr: string, data: SendReqDto) =>
  postAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnr}/aktoerer`, data);

export const slett = (databaseid: number) => deleteAsJson(`${API_BASE_URL}${FAGSAKER}/aktoerer/${databaseid}`);
