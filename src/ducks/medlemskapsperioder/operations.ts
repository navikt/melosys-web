import { doThenDispatch } from '../../services/utils';
import * as Api from '../../services/api';
import * as Types from './types';

export function hentMedlemskapsperioder(behandlingID: number) {
  return doThenDispatch(() => Api.Medlemskapsperioder.getMedlemskapsperioder(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}
