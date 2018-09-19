import { saksbehandlerOperations, saksbehandlerTypes } from './ducks/saksbehandler/';
import { KodeverkOperations } from './ducks/kodeverk/';
import { oppgaverOperations } from './ducks/oppgaver/';
import { buildinfo } from './utils/utils';

export default function loadInitialData(store) {
  const logdata = {
    message: 'loadInitalData',
    buildinfo: buildinfo(),
  };
  window.frontendlogger.info(logdata);
  store.dispatch(saksbehandlerOperations.hent())
    .then(response => {
      if (!response) {
        window.frontendlogger.error({
          message: 'Failed to load saksbehandler',
        });
      }
      if (response.type === saksbehandlerTypes.OK) {
        window.frontendlogger.info({
          saksbehandler: response.data,
        });
        store.dispatch(KodeverkOperations.hent()).then(kresponse => {
          if (kresponse) {
            window.frontendlogger.info({
              message: 'Kodeverk loaded',
            });
          } else {
            window.frontendlogger.error({
              message: 'Kodeverk FAILED loading',
            });
          }
        });

        store.dispatch(oppgaverOperations.hent()).then(oresponse => {
          if (oresponse) {
            window.frontendlogger.info({
              message: 'Oppgaver loaded',
            });
          } else {
            window.frontendlogger.error({
              message: 'Oppgaver FAILED loading',
            });
          }
        });
      }
    });
  store.dispatch(KodeverkOperations.hent());
}
