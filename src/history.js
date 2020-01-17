import { createBrowserHistory } from 'history';
import * as Constants from './constants';

const routerHistory = createBrowserHistory({
  basename: Constants.URL_BASENAME,
});
export default routerHistory;

