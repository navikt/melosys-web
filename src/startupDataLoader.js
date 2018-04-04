import { saksbehandlerOperations, saksbehandlerTypes } from './ducks/saksbehandler/';
import { kodeverkOperations } from './ducks/kodeverk/';

export default function loadInitialData(store) {
  store.dispatch(saksbehandlerOperations.hentSaksbehandler())
    .then(response => {
      if (response.type === saksbehandlerTypes.OK) {
        store.dispatch(kodeverkOperations.hentKodeverk());
      }
    });
}
