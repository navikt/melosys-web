/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */
import { doThenDispatch } from "../../services/utils";
import * as Utils from "../../utils";
import * as Api from "../../services/api";
import * as Types from "./types";

export function sok(sokefrase, aktiveBehandlinger) {
  const sokefraseErIdnr = Utils.person.erGyldigFnr(sokefrase);
  const sokefraseErOrgnr = Utils.organisasjon.erOrgnrGyldig(sokefrase);

  const body = {
    ident: sokefraseErIdnr ? sokefrase : null,
    saksnummer: sokefraseErIdnr || sokefraseErOrgnr ? null : sokefrase,
    orgnr: sokefraseErOrgnr ? sokefrase : null,
  };

  return doThenDispatch(() => Api.Fagsaker.sok.send(body, aktiveBehandlinger), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}
