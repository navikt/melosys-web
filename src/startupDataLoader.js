import { hentSaksbehandler } from './ducks/saksbehandler';

export default function loadInitialData(store) {
  store.dispatch(hentSaksbehandler());
}
