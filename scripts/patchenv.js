const moment = require('moment');
const dotenv = require('dotenv-save');
const branch = require('git-branch');
const readPkg = require('read-pkg');
// Read package.json into js map.
const pkg = readPkg.sync();

moment.locale('nb');

const buildNumber = process.env.BUILD_NUMBER || 'local';
const version = `${process.env.npm_package_version}`;
let branchName = process.env.BRANCH_NAME || 'unknown';
if (branchName === 'unknown') {
  branchName = branch.sync(process.cwd());
}
const {
  dependencies: {
    'melosys-kodeverk': kodeverk_versjon,
  },
} = pkg;
dotenv.set('REACT_APP_VERSION', version);
dotenv.set('REACT_APP_BUILD_DATETIME', moment().format('DD/MM/YYYY HH:mm'));
dotenv.set('REACT_APP_BUILD_VERSION', buildNumber);
dotenv.set('REACT_APP_BRANCH_NAME', branchName);
dotenv.set('REACT_APP_MELOSYS_KODEVERK', kodeverk_versjon);

