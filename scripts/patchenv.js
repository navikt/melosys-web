const dotenv = require('dotenv-save');
const branch = require('git-branch');
const readPkg = require('read-pkg');
// Read package.json into js map.
const pkg = readPkg.sync();

const buildNumber = process.env.BUILD_NUMBER || 'local';
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
dotenv.set('REACT_APP_BUILD_VERSION', buildNumber);
