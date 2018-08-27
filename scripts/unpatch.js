const dotenv = require('dotenv-save');
const writePkg = require('write-pkg');
const readPkg = require('read-pkg');

// Read package.json into js map.
const pkg = readPkg.sync();
if (pkg.homepage) {
  delete pkg.homepage;
  delete pkg._id;
  writePkg.sync(pkg);
}
dotenv.set('REACT_APP_API_BASE_URL', '/api/');
