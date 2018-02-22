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

import faktaavklaring_body from './pact-faktaavklaring-body';

require('es6-promise').polyfill();
require('isomorphic-fetch');

const { Matchers } = require('@pact-foundation/pact');

describe('FaktaavklaringPactApi', () => {
  const bid = 3;
  const FAKTAAVKLARING_API_URL = `${MOCK_ENV.FAKTAAVKLARING.path}/${bid}`;

  const provider = new Pact({
    port: MOCK_ENV.FAKTAAVKLARING.port,
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
          state: 'has an faktaavklaring object',
          uponReceiving: 'a request with an valid faktaavklaring object',
          withRequest: {
            method: 'GET',
            path: `${FAKTAAVKLARING_API_URL}`,
          },
          willRespondWith: {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
            body: faktaavklaring_body,
          },
        });
      });
  });
  it('returns a valid faktaavklaring', done => {
    Api.hentFaktaavklaring(bid, MOCK_ENV.FAKTAAVKLARING)
      .then((faktaavklaring) => {
        expect(faktaavklaring).to.be.a('object');
        expect(faktaavklaring).to.have.property('opphold');
        expect(faktaavklaring).to.have.property('aktivitet');
        expect(faktaavklaring).to.have.property('sysselsetting');

        expect(faktaavklaring).to.have.property('utsending');
        expect(faktaavklaring).to.have.property('bostedsland');
        expect(faktaavklaring).to.have.property('sektor');
        expect(faktaavklaring).to.have.property('tjenestemann');
        expect(faktaavklaring).to.have.property('sektor');
        expect(faktaavklaring).to.have.property('valgteArbeidsforhold');
        expect(faktaavklaring).to.have.property('virksomhet');

      })
      .then(done, done);
  });
/*
  it('returns a faktaavklaring med opphold', done => {
    Api.hentFaktaavklaringPact(url, port, bid)
      .then((faktaavklaring) => {
        const { opphold } = faktaavklaring;

        expect(faktaavklaring).to.have.property('opphold');
        expect(opphold).to.have.property('land');
        const { land } = opphold;
        expect(land).to.be.a('array');
      })
      .then(done, done);
  });

  it('returns a valid faktaavklaring med aktivitet', done => {
    Api.hentFaktaavklaringPact(url, port, bid)
      .then((faktaavklaring) => {
        const { aktivitet} = faktaavklaring;

        expect(faktaavklaring).to.have.property('aktivitet');
        expect(aktivitet).to.have.property('aktivitetLand');
        const { aktivitetLand } = aktivitet;
        expect(aktivitetLand).to.be.a('array');

      })
      .then(done, done);
  });
  it('returns a valid faktaavklaring', done => {
    Api.hentFaktaavklaringPact(url, port, bid)
      .then((faktaavklaring) => {
        const { sysselsetting } = faktaavklaring;

        expect(faktaavklaring).to.have.property('sysselsetting');
        expect(sysselsetting).to.have.property('sysselsettingType');
        const { sysselsettingType } = sysselsetting;
        expect(sysselsettingType).to.be.a('string');

      })
      .then(done, done);
  });
  it('returns a valid faktaavklaring med utsending', done => {
    Api.hentFaktaavklaringPact(url, port, bid)
      .then((faktaavklaring) => {
        expect(faktaavklaring).to.have.property('utsending');
        const { utsending } = faktaavklaring;
        expect(utsending).to.have.property('ansattINorskSelskap');
        const { ansattINorskSelskap, erstatterTidligereUtsendt, utsendingMindreEnn24Mnd } = utsending;
        expect(ansattINorskSelskap).to.be.a('boolean');
        expect(erstatterTidligereUtsendt).to.be.a('boolean');
        expect(utsendingMindreEnn24Mnd).to.be.a('boolean');
      })
      .then(done, done);
  });
  it('returns a valid faktaavklaring med bostedsland', done => {
    Api.hentFaktaavklaringPact(url, port, bid)
      .then((faktaavklaring) => {
        expect(faktaavklaring).to.have.property('utsending');
        const { bostedsland } = faktaavklaring;
        expect(bostedsland).to.have.property('bekrefterFamiliebosted');
        expect(bostedsland).to.have.property('bekrefterDisponering');
        expect(bostedsland).to.have.property('bostedsland');
      })
      .then(done, done);
  });
*/
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
