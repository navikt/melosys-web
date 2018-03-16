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
import vurdering_body from './pact-vurdering-body';

require('es6-promise').polyfill();
require('isomorphic-fetch');

describe('VurderingPactApi', () => {

  const bid = 3;
  const VURDERING_API_URL = `${MOCK_ENV.VURDERING.path}/${bid}`;

  const provider = new Pact({
    port: MOCK_ENV.VURDERING.port,
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
          state: 'has an vurdering object',
          uponReceiving: 'a request with an valid vurdering object',
          withRequest: {
            method: 'GET',
            path: `${VURDERING_API_URL}`,
          },
          willRespondWith: {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
            body: vurdering_body,
          },
        });
      });
  });
  it('returns a valid vurdering', done => {
    Api.hentVurdering(bid, MOCK_ENV.VURDERING)
      .then((vurderingen) => {
        expect(vurderingen).to.be.a('object');
        expect(vurderingen).to.have.property('behandlingID');
        expect(vurderingen).to.have.property('vurdering');
        const { vurdering } = vurderingen;
        expect(vurdering).to.have.property('lovvalgsbestemmelser');
        expect(vurdering).to.have.property('feilmeldinger');

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
