import { saksbehandlerOperations, saksbehandlerTypes } from './ducks/saksbehandler/';
import { KodeverkOperations } from './ducks/kodeverk/';
import { buildinfo } from './utils/utils';

export default function loadInitialData(store) {
  const logdata = {
    message: 'loadInitalData',
    buildinfo: buildinfo(),
  };
  window.frontendlogger.info(logdata);
  store.dispatch(saksbehandlerOperations.hent())
    .then(response => {
      if (response.type === saksbehandlerTypes.OK) {
        window.frontendlogger.info({
          saksbehandler: response.data,
        });
        store.dispatch(KodeverkOperations.hent());
      }
    });
  store.dispatch(KodeverkOperations.hent());
}
