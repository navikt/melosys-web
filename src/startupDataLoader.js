import { saksbehandlerOperations } from './ducks/saksbehandler/';

export default function loadInitialData(store) {
  store.dispatch(saksbehandlerOperations.hentSaksbehandler());
}
