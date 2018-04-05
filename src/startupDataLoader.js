import { saksbehandlerOperations } from './ducks/saksbehandler/';
import { KodeverkOperations } from './ducks/kodeverk/';

export default function loadInitialData(store) {
  store.dispatch(saksbehandlerOperations.hentSaksbehandler());
  store.dispatch(KodeverkOperations.hentKodeverk());
}
