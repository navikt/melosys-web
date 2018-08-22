const express = require('express');
const proxy = require('http-proxy-middleware');
const path = require('path');

const app = express();

const SCRIPTS_DIR = `${process.cwd()}`;
const PROJECT_ROOT = path.resolve(`${SCRIPTS_DIR}/..`);
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

const serverProxy = proxy({ target: 'http://localhost:3002', changeOrigin: true });
const apiContext = `${context}/api`;
app.use(apiContext, serverProxy);
if (!apiContext.startsWith('/api')) {
  app.use('/api', serverProxy);
}
app.use('/frontendlogger', serverProxy);

app.get(`${context}/*`, (req, res) => {
  res.sendFile(STATIC_BUILD_DIR, 'index.html');
});

app.listen(9000);
