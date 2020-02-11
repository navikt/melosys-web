const dotenv = require('dotenv-save');
const writePkg = require('write-pkg');
const readPkg = require('read-pkg');

const DEFAULT_JAVA_SERVER = 'http://melosys';

// update .env with custom version
dotenv.set('REACT_APP_BUILD_VERSION', 'kubefwd_local');
dotenv.set('REACT_APP_LOCAL_CONTEXT', '/melosys');
dotenv.set('REACT_APP_API_BASE_URL', '/api/');
dotenv.set('REACT_APP_JAVA_LOCAL_HOST', DEFAULT_JAVA_SERVER);
// set oidc-token from https://ida.adeo.no
dotenv.set('REACT_APP_OIDC_TEST_TOKEN', 'oidc-test-token');

const pkg = readPkg.sync();

const { proxy } = pkg;
proxy['/api'].target = DEFAULT_JAVA_SERVER;
pkg.proxy = proxy;

writePkg.sync(pkg);
