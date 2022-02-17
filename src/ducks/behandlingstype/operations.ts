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

export function hentMuligeBehandlingstyper(behandlingID: number) {
  return doThenDispatch(
    () => Api.Behandlinger.type.hentMuligeBehandlingstyper(behandlingID),
    {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
    {
      mapDispatchData: (data: any) => ({
        muligeBehandlingstyper: data,
      }),
    }
  );
}
