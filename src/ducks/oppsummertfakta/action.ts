import * as Types from './types';
import { Virksomheter } from '../../@types/avklartfakta';

export function oppdaterVirksomheter(virksomheter: Virksomheter): Types.OppdaterVirksomheterAction {
  return ({
    type: Types.OPPDATER_VIRKSOMHETER,
    data: virksomheter,
  });
}
