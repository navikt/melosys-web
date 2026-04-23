/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */
import { doThenDispatch } from "../../services/utils";
import * as Api from "../../services/api";
import * as Types from "./types";
import * as Actions from "./actions";

export function hentFakturaserier(fakturaserieReferanse: string) {
  return doThenDispatch(() => Api.Faktureringskomponenten.hentFakturaserier(fakturaserieReferanse), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function hentAlleFakturaserierForSak(saksnummer: string) {
  return doThenDispatch(
    async () => {
      const referanser = await Api.Fagsaker.fagsak.hentFakturaserieReferanser(saksnummer);
      const resultater = await Promise.allSettled(
        referanser.map((ref: string) => Api.Faktureringskomponenten.hentFakturaserie(ref)),
      );
      return resultater.filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled").map((r) => r.value);
    },
    {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
  );
}

export function resetFakturaserier() {
  return Actions.resetFakturaserier();
}
