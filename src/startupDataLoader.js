import * as Utils from './utils';
import { saksbehandlerOperations, saksbehandlerTypes } from './ducks/saksbehandler/';
import { oppgaverOperations } from './ducks/oppgaver/';

export default async function loadInitialData(store) {
  let res;
  try {
    window.frontendlogger.info(Utils.buildinfo());
    res = await store.dispatch(saksbehandlerOperations.hent());
    if (res && res.type === saksbehandlerTypes.OK) {
      window.frontendlogger.info({ saksbehandler: res.data.brukernavn });
      await store.dispatch(oppgaverOperations.oversikt());
    }
  } catch (e) {
    console.log(e); // eslint-disable-line no-console
    window.frontendlogger.error({
      e,
      stack: e.stack,
      res,
    });
  }
}
