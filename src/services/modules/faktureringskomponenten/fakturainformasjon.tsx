import { getAsJson } from "../../utils";
import { FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL } from "../../api-constants";

export enum FakturaStatus {
  "OPPRETTET" = "OPPRETTET",
  "BESTILLT" = "BESTILLT",
  "KANSELLERT" = "KANSELLERT",
  "BETALT" = "BETALT",
  "DELVIS_BETALT" = "DELVIS_BETALT",
}

export const hentFakturaserier = (referanseId: string, queries: string[]) =>
  getAsJson(
    `${FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL}fakturaserier?referanseId=${referanseId}${queries.map((query) => query)}`
  );

export const hentFakturaserie = (referanseId: string) =>
  getAsJson(`${FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL}fakturaserier/${referanseId}`);

export const hentFakturainfo = (fakturaNr: string) =>
  getAsJson(`${FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL}faktura/${fakturaNr}`);
