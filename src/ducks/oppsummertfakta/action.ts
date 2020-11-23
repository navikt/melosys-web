import * as Types from './types';
import { Virksomheter } from 'Domene';

export function oppdaterVirksomheter(virksomheter: Virksomheter): Types.OppdaterVirksomheterAction {
  return ({
    type: Types.OPPDATER_VIRKSOMHETER,
    data: virksomheter,
  });
}

export function resetOppsummertFakta(): Types.ResetAction {
  return { type: Types.RESET_OPPSUMMERTFAKTA };
}
