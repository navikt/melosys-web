import { getAsJson } from "../../utils";
import { FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL } from "../../api-constants";

export enum FakturaStatus {
  "OPPRETTET" = "OPPRETTET",
  "BESTILLT" = "BESTILLT",
  "KANSELLERT" = "KANSELLERT",
  "BETALT" = "BETALT",
  "DELVIS_BETALT" = "DELVIS_BETALT",
}

export const hentFakturaserier = (saksnummer: string, queries: string[]) =>
  getAsJson(
    `${FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL}fakturaserier?saksnummer=${saksnummer}${queries.map((query) => query)}`
  );

export const hentFakturainfo = (fakturaNr: string) =>
  getAsJson(`${FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL}faktura/${fakturaNr}`);
