import { saksbehandlerOperations, saksbehandlerTypes } from './ducks/saksbehandler/';
import { KodeverkOperations } from './ducks/kodeverk/';


export default function loadInitialData(store) {
  store.dispatch(saksbehandlerOperations.hent())
    .then(response => {
      if (response.type === saksbehandlerTypes.OK) {
        store.dispatch(KodeverkOperations.hent());
      }
    });
  store.dispatch(KodeverkOperations.hent());
}
