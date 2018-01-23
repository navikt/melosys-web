import { createBrowserHistory } from 'history';
import { CONTEXT_PATH } from './constants'; // eslint-disable-line

function isProductionEnv() {
  return `${process.env.NODE_ENV}` === 'production';
}
const contextPath = isProductionEnv() ? CONTEXT_PATH : '';
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

