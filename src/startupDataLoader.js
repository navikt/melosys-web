import { hentSaksbehandler } from './ducks/saksbehandler';
import { hentTidligeresaker } from './ducks/tidligeresaker';
import { hentSakerbehandles } from './ducks/sakerbehandles';

export default function loadInitialData(store) {
  store.dispatch(hentSaksbehandler())
    .then(() => {
      store.dispatch(hentSakerbehandles(store.getState().saksbehandler.data.brukernavn));
      store.dispatch(hentTidligeresaker(store.getState().saksbehandler.data.brukernavn));
    });
}
