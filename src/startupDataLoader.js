import { hentSaksbehandler } from './ducks/saksbehandler';

export default function loadInitialData(dispatch) {
  dispatch(hentSaksbehandler())
    .then(value => console.log('saksbehandler', value));
}
