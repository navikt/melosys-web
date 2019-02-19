import { createBrowserHistory } from 'history';

const NO_CONTEXT_PATH = '/';

const routerHistory = createBrowserHistory({
  basename: NO_CONTEXT_PATH,
});
export default routerHistory;

