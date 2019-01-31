import { saksbehandlerOperations, saksbehandlerTypes } from './ducks/saksbehandler/';
import { oppgaverOperations } from './ducks/oppgaver/';
import { buildinfo } from './utils/utils';

export default async function loadInitialData(store) {
  let res;
  try {
    window.frontendlogger.info(buildinfo());
    res = await store.dispatch(saksbehandlerOperations.hent());
    if (res && res.type === saksbehandlerTypes.OK) {
      window.frontendlogger.info(res.data);
      await store.dispatch(oppgaverOperations.hent());
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
