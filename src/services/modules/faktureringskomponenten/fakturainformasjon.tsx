import { getAsJson } from "../../utils";
import { FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL } from "../../api-constants";

export const hentFakturaserie = (vedtaksId: string) =>
  getAsJson(`${FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL}fakturaserie/${vedtaksId}`);
