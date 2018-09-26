import { saksbehandlerOperations, saksbehandlerTypes } from './ducks/saksbehandler/';
import { KodeverkOperations } from './ducks/kodeverk/';
import { oppgaverOperations } from './ducks/oppgaver/';
// import { buildinfo } from './utils/utils';

export default async function loadInitialData(store) {
  let res;
  try {
    res = await store.dispatch(saksbehandlerOperations.hent());
    if (res && res.type === saksbehandlerTypes.OK) {
      await store.dispatch(KodeverkOperations.hent());
      await store.dispatch(oppgaverOperations.hent());
    }
  } catch (e) {
    console.log(e);
  }
}
