const momentTZ = require('moment-timezone');
const dotenv = require('dotenv-save');
const branch = require('git-branch');
const readPkg = require('read-pkg');
// Read package.json into js map.
const pkg = readPkg.sync();

const buildNumber = process.env.BUILD_NUMBER || 'local';
const version = `${process.env.npm_package_version}`;
let branchName = process.env.BRANCH_NAME || 'unknown';
if (branchName === 'unknown') {
  branchName = branch.sync(process.cwd());
}
const {
  dependencies: {
    'melosys-kodeverk': kodeverk_versjon,
    react: react_lib_versjon,
  },
} = pkg;
dotenv.set('REACT_APP_VERSION', version);
dotenv.set('REACT_APP_BUILD_DATETIME', momentTZ().tz('Europe/Oslo').format('DD/MM/YYYY HH:mm'));
dotenv.set('REACT_APP_BUILD_VERSION', buildNumber);
dotenv.set('REACT_APP_BRANCH_NAME', branchName);
dotenv.set('REACT_APP_MELOSYS_KODEVERK', kodeverk_versjon);
dotenv.set('REACT_APP_REACT_LIB', react_lib_versjon.slice(1));

