const moment = require('moment');
const dotenv = require('dotenv-save');

moment.locale('nb');

const jenkinsBuildNumber = process.env.BUILD_NUMBER || 'local';
const version = `v${process.env.npm_package_version}:${jenkinsBuildNumber}`;
dotenv.set('REACT_APP_VERSION', version);
dotenv.set('REACT_APP_DATETIME', moment().format('LLLL'));
