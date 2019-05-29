/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */

import { doThenDispatch } from '../../services/utils';
import * as Api from '../../services/api';
import * as Types from './types';
import * as Actions from './actions';

/* eslint-disable import/prefer-default-export */
export function hentBucSedRelasjoner() {
  return doThenDispatch(() => Api.Sed.hentBucSedRelasjoner(), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function oppdaterBucSedRelasjoner(bucinfo) {
  return Actions.oppdaterBucSedRelasjoner(bucinfo);
}

export function hentMottakerinstitusjoner(bucType) {
  return doThenDispatch(() => Api.Sed.hentMottakerinstitusjoner(bucType), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function oppdaterMottakerinstitusjoner(institusjoner) {
  return Actions.oppdaterMottakerinstitusjoner(institusjoner);
}

export function opprettBuc(behandlingID, bucData) {
  return doThenDispatch(() => Api.Sed.opprettBuc(behandlingID, bucData), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function hentSedUnderArbeid(behandlingID) {
  return doThenDispatch(() => Api.Sed.hentSedUnderArbeid(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function oppdaterSedUnderArbeid(sedUnderArbeid) {
  return Actions.oppdaterSedUnderArbeid(sedUnderArbeid);
}
