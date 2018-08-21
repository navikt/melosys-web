const path = require('path');
const writePkg = require('write-pkg');
const readPkg = require('read-pkg');

let pkg = readPkg.sync();
const homepage = pkg['disabled-homepage'];
pkg.homepage = homepage;
delete pkg['disabled-homepage'];

writePkg.sync(pkg);
