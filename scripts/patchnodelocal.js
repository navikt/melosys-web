const writePkg = require('write-pkg');
const readPkg = require('read-pkg');

const DEFAULT_NODE_MOCK_SERVER = 'http://localhost:3002';

// Read package.json into js map.
const pkg = readPkg.sync();
const { proxy } = pkg;

const patchPackageNodeLocal = () => {
  delete pkg.homepage;
  delete pkg._id;

  if (proxy['/api'].target !== DEFAULT_NODE_MOCK_SERVER) {
    proxy['/api'].target = DEFAULT_NODE_MOCK_SERVER;
  }
  if (proxy['/frontendlogger'].target !== DEFAULT_NODE_MOCK_SERVER) {
    proxy['/frontendlogger'].target = DEFAULT_NODE_MOCK_SERVER;
  }
  // get value of 'disabled-hompage'
  if (!pkg['disabled-homepage']) {
    pkg['disabled-homepage'] = 'http://eesi2.no/melosys';
  }
  writePkg.sync(pkg);
};
patchPackageNodeLocal();

