import { createBrowserHistory } from 'history';
//import { getFodselsnummer } from './bootstrap/fnr-util';
import { CONTEXT_PATH } from './constants'; // eslint-disable-line

const routerHistory = createBrowserHistory({
  basename: CONTEXT_PATH,
});
export default routerHistory;