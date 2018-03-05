const moment = require('moment');
moment.locale('nb');
const dotenv = require('dotenv-save');
const version = process.env.npm_package_version;
dotenv.set('REACT_APP_VERSION', version);
dotenv.set('REACT_APP_DATETIME', moment().format('LLLL'));

