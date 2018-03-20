// Action Creators
import { doThenDispatch } from '../../services/utils';
import * as Api from '../../services/api';

import * as Types from './types';

export function hentFagsaker(snr) {
  return doThenDispatch(() => Api.hentFagsaker(snr), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function opprettNyFagsak(fnr) {
  return doThenDispatch(() => Api.opprettNyFagsak(fnr), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}
