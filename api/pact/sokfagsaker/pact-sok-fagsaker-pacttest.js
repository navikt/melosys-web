/* eslint-disable */
import * as Api from '../../../src/services/api';
import { MOCK_ENV } from '../mock_env';

const LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.should();
chai.use(chaiAsPromised);
const expect = chai.expect;
const assert = chai.assert;

const path = require('path');
const { Pact } = require('@pact-foundation/pact');
require('es6-promise').polyfill();
require('isomorphic-fetch');

const { Matchers } = require('@pact-foundation/pact');
import sok_fagsaker_body from './pack-sok-fagsaker-body';



describe('SokFagsakerPactApi', () => {
  const fnr = '05056335023';
  const SOK_FAGSAKER_API_URL = `${MOCK_ENV.SOK_FAGSAKER.path}/`; //NB! Ikke legg på fnr her. pga /?fnr=${fnr} som query param

  const provider = new Pact({
    port: MOCK_ENV.SOK_FAGSAKER.port,
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
            path: `${SOK_FAGSAKER_API_URL}`,
            query: {fnr}
          },
          willRespondWith: {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
            body: sok_fagsaker_body,
          },
        });
      });
  });

  it('returns an array of fagsaker response', done => {
    Api.hentNyesaker(fnr, MOCK_ENV.SOK_FAGSAKER)
      .then((fagsaker) => {
        expect(fagsaker).to.be.a('array');
        expect(fagsaker).to.have.lengthOf(1);
      })
      .then(done, done);
  });

  it('to have a fagsak object with required properties', done => {
    Api.hentNyesaker(fnr, MOCK_ENV.SOK_FAGSAKER).then(fagsaker => fagsaker.forEach(fagsak => {
      expect(fagsak).to.have.property('saksnummer');
      expect(fagsak).to.have.property('sammensattNavn');
      expect(fagsak).to.have.property('type');
      expect(fagsak).to.have.property('status');
      expect(fagsak).to.have.property('registrertDato');
      expect(fagsak).to.have.property('kjoenn');
    })).then(done, done);
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
