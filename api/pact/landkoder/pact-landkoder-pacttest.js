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
const LANDKODER_API_URL = '/api/landkoder';
import landkoder_body from './pact-landkoder-body';

require('es6-promise').polyfill();
require('isomorphic-fetch');

const { Matchers } = require('@pact-foundation/pact');

describe('LandkoderPactApi', () => {
  let url = 'http://localhost';
  const { like } = Matchers;
  const port = 8991;

  let dir = path.resolve(process.cwd(), 'pacts');

  const provider = new Pact({
    port,
    log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
    dir: dir.replace(/\\/g, "/"),
    spec: 2,
    consumer: 'melosys-web',
    provider: 'melosys-api-landkoder',
    pactfileWriteMode: 'merge',
    logLevel: LOG_LEVEL,
  });

  before(() => {
    return provider.setup()
      .then(() => {
        provider.addInteraction({
          state: 'has an array of landkoder',
          uponReceiving: 'a request for an array of landkoder',
          withRequest: {
            method: 'GET',
            path: `${LANDKODER_API_URL}`,
          },
          willRespondWith: {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
            body: landkoder_body,
          },
        });
      });
  });

  it('returns an array of landkoder response', done => {
    /*
    const landkoder = Api.hentLandkoderPact(url, port);
    expect(landkoder).to.eventually.be.a('array').and.notify(done);
    */
    Api.hentLandkoderPact(url, port)
      .then((landkoder) => {
        expect(landkoder).to.be.a('array');
        expect(landkoder).to.have.lengthOf(1);
      })
      .then(done, done);
  });

  it('to have a landkode object with property kode and term', done => {
    Api.hentLandkoderPact(url, port).then(landkoder => landkoder.forEach(landkode => {
      expect(landkode).to.have.property('kode');
      expect(landkode).to.have.property('term');
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
