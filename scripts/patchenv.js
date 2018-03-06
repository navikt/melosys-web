const moment = require('moment');
const dotenv = require('dotenv-save');

moment.locale('nb');

const buildNumber = process.env.BUILD_NUMBER || 'local';
const branchName = process.env.BRANCH_NAME || 'unknown';
const version = `v${process.env.npm_package_version}`;
dotenv.set('REACT_APP_VERSION', version);
dotenv.set('REACT_APP_BUILD_DATETIME', moment().format('DDMMMYYYY-HH:mm:ss'));
dotenv.set('REACT_APP_BUILD_VERSION', buildNumber);
dotenv.set('REACT_APP_BRANCH_NAME', branchName);
