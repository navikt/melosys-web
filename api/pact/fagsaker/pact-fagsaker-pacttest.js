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
const snr = 3;
const FAGSAKER_API_URL = `/api/fagsaker/${snr}`;
import fagsaker_body from './pact-fagsaker-body';

require('es6-promise').polyfill();
require('isomorphic-fetch');

const { Matchers } = require('@pact-foundation/pact');

describe('FagsakerPactApi', () => {
  let url = 'http://localhost';
  const { like } = Matchers;
  const port = 8993;


  const provider = new Pact({
    port,
    log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    spec: 2,
    consumer: 'melosys-web',
    provider: 'melosys-api-fagsaker',
    pactfileWriteMode: 'merge',
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

  it('returns a fagsak object with an array of hehandlinger response', done => {
    Api.hentFagsakerPact(url, port, snr)
      .then((fagsaker) => {
        expect(fagsaker).to.be.a('object');
        expect(fagsaker).to.have.property('saksnummer');
        expect(fagsaker).to.have.property('type');
        expect(fagsaker).to.have.property('status');
        expect(fagsaker).to.have.property('registrertDato');
        expect(fagsaker).to.have.property('behandlinger');
/*
        expect(fagsaker.behandlinger).to.be.a('array');
        expect(fagsaker.behandlinger).to.have.lengthOf(1);
        */
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
