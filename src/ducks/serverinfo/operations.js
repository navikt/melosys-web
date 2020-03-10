import { doThenDispatch } from '../../services/utils';
import * as Api from '../../services/api';
import * as Types from './types';

export function hent() {
  return doThenDispatch(() => Api.ServerInfo.hentServerInfo(), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}
