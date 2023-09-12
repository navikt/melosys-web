import { getAsJson } from "../../utils";
import { FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL } from "../../api-constants";

export enum FakturaStatus {
  "OPPRETTET" = "OPPRETTET",
  "BESTILLT" = "BESTILLT",
  "KANSELLERT" = "KANSELLERT",
  "BETALT" = "BETALT",
  "DELVIS_BETALT" = "DELVIS_BETALT",
}

export const hentFakturaserier = (referanse: string, queries: string[]) =>
  getAsJson(
    `${FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL}fakturaserier?referanse=${referanse}${queries.map((query) => query)}`
  );

export const hentFakturaserie = (referanse: string) =>
  getAsJson(`${FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL}fakturaserier/${referanse}`);

export const hentFakturainfo = (fakturaNr: string) =>
  getAsJson(`${FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL}faktura/${fakturaNr}`);
