const dotenv = require('dotenv-save');
const writePkg = require('write-pkg');
const readPkg = require('read-pkg');

// Read package.json into js map.
const pkg = readPkg.sync();
// get value of 'disabled-hompage'
const homepage = pkg['disabled-homepage'];
// apply value to new key 'homepage'
pkg.homepage = homepage;
// remove key 'disabled-homepage'
delete pkg['disabled-homepage'];
// write new content to package.json
writePkg.sync(pkg);

// update .env with custom version
dotenv.set('REACT_APP_BUILD_VERSION', 'java_local');
