import { getAsJson } from "../../utils";
import { FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL } from "../../api-constants";

export const hentFakturaserier = (referanse: string) =>
  getAsJson(`${FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL}fakturaserier?referanse=${referanse}`);

export const hentFakturaserie = (referanse: string) =>
  getAsJson(`${FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL}fakturaserier/${referanse}`);
