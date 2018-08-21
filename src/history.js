import { createBrowserHistory } from 'history';

const CONTEXT_PATH = '/melosys';
/*
const NO_CONTEXT_PATH = '/';

const isLocalJavaDevEnv = () => `${process.env.REACT_APP_BUILD_VERSION}` === 'java_local';

const contextPath = isLocalJavaDevEnv() ? CONTEXT_PATH : NO_CONTEXT_PATH;
*/
/* eslint-enable no-console */
const routerHistory = createBrowserHistory({
  basename: CONTEXT_PATH,
});
export default routerHistory;

