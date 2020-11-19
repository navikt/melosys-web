import * as Types from './types';

export function oppdaterVirksomheter(virksomheter: Types.Data): Types.OppdaterVirksomheterAction {
  return ({
    type: Types.OPPDATER_VIRKSOMHETER,
    data: virksomheter,
  });
}
