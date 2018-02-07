import { createBrowserHistory } from 'history';

const CONTEXT_PATH = '/melosys-web';
const NO_CONTEXT_PATH = '/';

function isProductionEnv() {
  return `${process.env.NODE_ENV}` === 'production';
}

function hasCombinedWarDeployment() {
  const combinedDeployment = `${process.env.REACT_APP_COMBINED_WAR_DEPLOYMENT}`;
  return combinedDeployment && combinedDeployment.toLowerCase() === 'true';
}

let contextPath = NO_CONTEXT_PATH; // default

if (isProductionEnv()) {
  if (hasCombinedWarDeployment() === false) {
    contextPath = CONTEXT_PATH; // Need context path to work in NGINX
  }
}
/* eslint-disable no-console */
if (isProductionEnv()) {
  console.log(`NODE_ENV:${process.env.NODE_ENV}`, `basename:${contextPath}`);
} else {
  console.log(`NODE_ENV:${process.env.NODE_ENV}`, 'basename:"" no context path');
}
/* eslint-enable no-console */
const routerHistory = createBrowserHistory({
  basename: contextPath,
});
export default routerHistory;

