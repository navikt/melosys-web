const pact = require('@pact-foundation/pact-node');
const path = require('path');
const opts = {
  pactFilesOrDirs: [path.resolve(__dirname, '../pacts/melosys-saksbehandler.json')],
  pactBroker: process.env.PACT_BROKERURL,
  pactBrokerUsername: process.env.PACT_USERNAME,
  pactBrokerPassword: process.env.PACT_PASSWORD,
  tags: ['test'],
  consumerVersion: '1.0.0'
};
