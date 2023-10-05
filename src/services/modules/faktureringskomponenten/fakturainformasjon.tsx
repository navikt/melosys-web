import { getAsJson } from "../../utils";
import { FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL } from "../../api-constants";

export enum FakturaStatus {
  "OPPRETTET" = "OPPRETTET",
  "BESTILLT" = "BESTILLT",
  "KANSELLERT" = "KANSELLERT",
  "BETALT" = "BETALT",
  "DELVIS_BETALT" = "DELVIS_BETALT",
}

export const hentFakturaserier = (referanse: string) =>
  getAsJson(`${FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL}fakturaserier?referanse=${referanse}`);

export const hentFakturaserie = (referanse: string) =>
  getAsJson(`${FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL}fakturaserier/${referanse}`);
