/* eslint-disable */
import * as Api from '../../../src/services/api';

const LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.should();
chai.use(chaiAsPromised);
const expect = chai.expect;
const assert = chai.assert;

const path = require('path');
const { Pact } = require('@pact-foundation/pact');
const SAKSBEHANDLER_API_URL = '/api/saksbehandler';
import saksbehandler_body from './pact-saksbehandler-body';

require('es6-promise').polyfill();
require('isomorphic-fetch');




const { Matchers } = require('@pact-foundation/pact');

describe('SaksbehandlerPactApi', () => {
  let url = 'http://localhost';
  const { like } = Matchers;
  const port = 8990;

  let dir = path.resolve(process.cwd(), 'pacts');

  const provider = new Pact({
    port,
    log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
    dir: dir.replace(/\\/g, "/"),
    spec: 2,
    consumer: 'melosys-web',
    provider: 'melosys-api',
    pactfileWriteMode: 'merge',
    logLevel: LOG_LEVEL,
  });

  before(() => {
    return provider.setup()
      .then(() => {
        provider.addInteraction({
          state: 'has a single saksbehandler',
          uponReceiving: 'a request for a single saksbehandler',
          withRequest: {
            method: 'GET',
            path: `${SAKSBEHANDLER_API_URL}`,
          },
          willRespondWith: {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
            body: saksbehandler_body,
          },
        });
    });
  });

  it('returns a saksbehandler response', done => {
    expect(Api.hentSaksbehandlerPact(url, port)).to.eventually.have.property('brukernavn').and.notify(done);
  });

  after(() => {
    console.log("Verifing interactions on the contract.");
    return provider.verify().then(() => {
      console.log("Writing pact files.");
      return provider.finalize().catch(err => {
        console.error("Coulndt write pact files:");
        console.error(err);
      });
    });
  });
});


process.on('unhandledRejection', (err) => {
  console.error("An error occurred.");
  console.error(err);
});
