/* eslint-disable */
import * as Api from '../../../src/services/api';
import { MOCK_ENV } from '../mock_env';
import fagsaker_body from './pact-fagsaker-body';
import arbeidsforhold from "./arbeidsforhold-body";
import organiasjoner from "./organisasjoner-body";
import medlemskap from "./medlemskap-body";
import inntekt from "./inntekt-body";
import person from "./person-body";

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
          state: 'as an array of fagsaker',
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

        const { saksnummer, type, status, registrertDato, behandlinger } = fagsaker;
        expect(saksnummer).to.be.a('number');
        expect(type).to.be.a('string');
        expect(status).to.be.a('string');
        expect(registrertDato).to.be.a('string');

        expect(behandlinger).to.be.a('array');
        const [behandling] = behandlinger;
        expect(behandling).to.be.a('object');
        expect(behandling).to.have.property('oppsummering');
        expect(behandling).to.have.property('saksopplysninger');
        expect(behandling).to.have.property('arbeidsforhold');
        expect(behandling).to.have.property('organiasjoner');
        expect(behandling).to.have.property('medlemskap');
        expect(behandling).to.have.property('inntekt');
        expect(behandling).to.have.property('behandlingshistorikk');
        expect(behandling).to.have.property('oppsummering');

        const { oppsummering, saksopplysninger, arbeidsforhold, organiasjoner, medlemskap, inntekt, behandlingshistorikk } = behandling;
        expect(oppsummering).to.be.a('object');
        expect(saksopplysninger).to.be.a('object');
        expect(arbeidsforhold).to.be.a('array');
        expect(organiasjoner).to.be.a('array');
        expect(medlemskap).to.be.a('object');
        expect(inntekt).to.be.a('object');
        expect(behandlingshistorikk).to.be.a('array');

        expect(oppsummering).to.have.property('behandlingID');
        expect(oppsummering).to.have.property('gsakId');
        expect(oppsummering).to.have.property('status');
        const { behandlingID, gsakId, status: o_status, type: o_type, registrertDato: o_dato } = oppsummering;
        expect(behandlingID).to.be.a('number');
        expect(gsakId).to.be.a('number');
        expect(o_status).to.be.a('string');
        expect(o_type).to.be.a('string');
        expect(o_dato).to.be.a('string');

        expect(saksopplysninger).to.have.property('person');
        const { person } = saksopplysninger;
        expect(person).to.have.property('fnr');
        expect(person).to.have.property('sivilstand');
        expect(person).to.have.property('statsborgerskap');
        expect(person).to.have.property('sammensattNavn');
        expect(person).to.have.property('bostedsadresse');
        expect(person).to.have.property('kjoenn');
        expect(person).to.have.property('foedselsdato');
        const { fnr, sivilstand, statsborgerskap, sammensattNavn, bostedsadresse, kjoenn, foedselsdato } = person;
        expect(fnr).to.be.a('string');
        expect(sivilstand).to.be.a('string');
        expect(statsborgerskap).to.be.a('string');
        expect(sammensattNavn).to.be.a('string');
        expect(bostedsadresse).to.be.a('object');
        expect(kjoenn).to.be.a('string');
        expect(foedselsdato).to.be.a('string');

        expect(arbeidsforhold).to.be.a('array');
        const [arbeidsforholdet] = arbeidsforhold;
        expect(arbeidsforholdet).to.have.property('arbeidsforholdID');
        expect(arbeidsforholdet).to.have.property('arbeidsforholdIDnav');
        expect(arbeidsforholdet).to.have.property('ansettelsesPeriode');
        expect(arbeidsforholdet).to.have.property('arbeidsforholdstype');
        expect(arbeidsforholdet).to.have.property('arbeidsavtaler');
        expect(arbeidsforholdet).to.have.property('permisjonOgPermittering');
        expect(arbeidsforholdet).to.have.property('utenlandsopphold');
        expect(arbeidsforholdet).to.have.property('arbeidsgivertype');
        expect(arbeidsforholdet).to.have.property('arbeidsgiverID');
        expect(arbeidsforholdet).to.have.property('arbeidstakerID');
        expect(arbeidsforholdet).to.have.property('opplysningspliktigtype');
        expect(arbeidsforholdet).to.have.property('opplysningspliktigID');
        expect(arbeidsforholdet).to.have.property('opprettelsestidspunkt');
        expect(arbeidsforholdet).to.have.property('sistBekreftet');
        expect(arbeidsforholdet).to.have.property('Aordning');
      })
      .then(done, done);
  });

  after(() => {
    console.log("Verifing interactions on the contract.");
    return provider.verify().then(() => {
      console.log("Writing pact files.");
      return provider.finalize().catch(err => {
        console.error("Verification FAILED!");
        console.error(err);
      });
    });
  });
});

process.on('unhandledRejection', (err) => {
  console.error("An error occurred.");
  console.error(err);
});
