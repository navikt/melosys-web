import { createBrowserHistory } from 'history';

const CONTEXT_PATH = '/melosys';
const NO_CONTEXT_PATH = '/';

const isLocalAllixENv = () => `${process.env.REACT_APP_BUILD_VERSION}` === 'allix';

const contextPath = isLocalAllixENv() ? CONTEXT_PATH : NO_CONTEXT_PATH;

/* eslint-enable no-console */
const routerHistory = createBrowserHistory({
  basename: contextPath,
});
export default routerHistory;

