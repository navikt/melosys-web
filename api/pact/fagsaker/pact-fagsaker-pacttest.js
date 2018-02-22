/* eslint-disable */
import * as Api from '../../../src/services/api';
import { MOCK_ENV } from '../mock_env';
import fagsaker_body from './pact-fagsaker-body';

const path = require('path');

require('es6-promise').polyfill();
require('isomorphic-fetch');
const {
  describe, before, after, it,
} = require('mocha');
const { Pact } = require('@pact-foundation/pact');
const chai = require('chai');
chai.should();
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;
//const assert = chai.assert;


describe('FagsakerPactApi', () => {
  const LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';
  const snr = 3;
  const FAGSAKER_API_URL = `${MOCK_ENV.FAGSAKER.path}/${snr}`;
  const provider = new Pact({
    port: MOCK_ENV.FAGSAKER.port,
    log: path.resolve(process.cwd(), MOCK_ENV.PACT_CONFIG.log.dir, MOCK_ENV.PACT_CONFIG.log.logfile),
    dir: path.resolve(process.cwd(), MOCK_ENV.PACT_CONFIG.dir),
    spec: MOCK_ENV.PACT_CONFIG.spec,
    consumer: MOCK_ENV.PACT_CONFIG.consumer_name,
    provider: MOCK_ENV.PACT_CONFIG.provider_name,
    pactfileWriteMode: MOCK_ENV.PACT_CONFIG.pactfileWriteMode,
    logLevel: LOG_LEVEL,
  });

  before(() => {
    return provider.setup()
      .then(() => {
        provider.addInteraction({
          state: 'has an array of fagsaker',
          uponReceiving: 'a request for an array of fagsaker',
          withRequest: {
            method: 'GET',
            path: `${FAGSAKER_API_URL}`,
          },
          willRespondWith: {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
            body: fagsaker_body,
          },
        });
      });
  });

  it('returns a fagsak object with an array of behandlinger response', done => {
    Api.hentFagsaker(snr, MOCK_ENV.FAGSAKER)
      .then((fagsaker) => {
        expect(fagsaker).to.be.a('object');
        expect(fagsaker).to.have.property('saksnummer');
        expect(fagsaker).to.have.property('type');
        expect(fagsaker).to.have.property('status');
        expect(fagsaker).to.have.property('registrertDato');
        expect(fagsaker).to.have.property('behandlinger');
      })
      .then(done, done);
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
