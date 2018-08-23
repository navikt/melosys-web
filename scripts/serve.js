const express = require('express');
const proxy = require('http-proxy-middleware');
const path = require('path');

const app = express();

const PROJECT_ROOT = `${process.cwd()}`;
const STATIC_BUILD_DIR = path.join(PROJECT_ROOT, 'build');
const envfile = `${PROJECT_ROOT}/.env`;
require('dotenv').config({ path: envfile });

const isLocalJavaDevEnv = () => `${process.env.REACT_APP_BUILD_VERSION}` === 'java_local';
const context = isLocalJavaDevEnv() ? '/melosys' : '';

if (!isLocalJavaDevEnv()) {
  app.use(express.static(STATIC_BUILD_DIR));
} else {
  app.use('/melosys', express.static(STATIC_BUILD_DIR));
}
const apiServer = 'http://localhost:3002';
const serverProxy = proxy({ target: apiServer, changeOrigin: true });
const apiContext = `${context}/api`;
app.use(apiContext, serverProxy);
if (!apiContext.startsWith('/api')) {
  app.use('/api', serverProxy);
}
app.use('/frontendlogger', serverProxy);

app.get(`${context}/*`, (req, res) => {
  res.sendFile(STATIC_BUILD_DIR, 'index.html');
});
const serverPort = 9000;
app.listen(serverPort);
const staticServer = `http://localhost:${serverPort}${context}`;

const message = `\nRunning simplfied static web server "${staticServer}" \n\twith data from "${STATIC_BUILD_DIR}" \n\tand proxy api calls to "${apiServer}${apiContext}"`;
console.log(message); // eslint-disable-line no-console
