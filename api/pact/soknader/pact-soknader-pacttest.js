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
import soknader_body from './pact-soknader-body';

require('es6-promise').polyfill();
require('isomorphic-fetch');

const { Matchers } = require('@pact-foundation/pact');

describe('SoknaderPactApi', () => {
  const bid = 3;
  const SOKNADER_API_URL = `${MOCK_ENV.SOKNADER.path}/${bid}`;

  const provider = new Pact({
    port: MOCK_ENV.SOKNADER.port,
    log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
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
          state: 'has an soknader object',
          uponReceiving: 'a request with an valid soknader object',
          withRequest: {
            method: 'GET',
            path: `${SOKNADER_API_URL}`,
          },
          willRespondWith: {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
            body: soknader_body,
          },
        });
      })
      /*.then(() => {
        provider.addInteraction({
          state: 'POST a soknads objekt',
          uponReceiving: 'a request with an valid soknader object',
          withRequest: {
            method: 'POST',
            path: `${SOKNADER_API_URL}`,
          },
          willRespondWith: {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
            body: soknader_body,
          },
        })
      });*/
  });
  /*
  it('return s a post', done => {
    Api.sendSoknad(host, port, bid, soknader_body)
      .then((soknader) => {
        expect(soknader).to.be.a('object');
      })
  });
  */
  it('returns a valid soknader', done => {
    Api.hentSoknader(bid, MOCK_ENV.SOKNADER)
      .then((soknader) => {
        expect(soknader).to.be.a('object');
        expect(soknader).to.have.property('behandlingID');
        const { soknadDokument } = soknader;
        expect(soknadDokument).to.have.property('opplysningerOmBrukeren');
        expect(soknadDokument).to.have.property('arbeidUtland')

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
