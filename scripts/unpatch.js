const fs = require('fs');
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

const createDotEnvFileIfnotExists = (dir = `${process.cwd()}/.env`) => !fs.existsSync(dir) && fs.writeFileSync(dir, '');
createDotEnvFileIfnotExists();
dotenv.set('REACT_APP_NAME', 'Melosys');
dotenv.set('REACT_APP_API_BASE_URL', '/api/');
dotenv.set('REACT_APP_JAVA_LOCAL_HOST', '');
dotenv.set('REACT_APP_LOCAL_CONTEXT', '');
