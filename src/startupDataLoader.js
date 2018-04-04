import { saksbehandlerOperations } from './ducks/saksbehandler/';
import { kodeverkOperations } from './ducks/kodeverk/';

export default function loadInitialData(store) {
  store.dispatch(saksbehandlerOperations.hentSaksbehandler().then(kodeverkOperations.hentKodeverk()));
}
