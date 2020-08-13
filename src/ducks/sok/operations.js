/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */
import FnrValidator from '@navikt/fnrvalidator';

import { doThenDispatch } from '../../services/utils';
import * as Api from '../../services/api';
import * as Types from './types';

export function sok(sokefrase) {
  const sokefraseErIdnr = FnrValidator.idnr(sokefrase).status === 'valid';

  const body = {
    ident: sokefraseErIdnr ? sokefrase : null,
    saksnummer: sokefraseErIdnr ? null : sokefrase,
  };

  return doThenDispatch(() => Api.Fagsaker.sok.send(body), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}
