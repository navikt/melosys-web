import { createBrowserHistory } from 'history';

const CONTEXT_PATH = '/melosys/'; // Must end with '/', since /melosys/static, /melosys/api, etc. Webpack compile.
const NO_CONTEXT_PATH = '/';

const isLocalJavaDevEnv = () => `${process.env.REACT_APP_BUILD_VERSION}` === 'java_local';

const contextPath = isLocalJavaDevEnv() ? CONTEXT_PATH : NO_CONTEXT_PATH;
console.log('history: contextPath=', contextPath);
/* eslint-enable no-console */
const routerHistory = createBrowserHistory({
  basename: contextPath,
});
export default routerHistory;

