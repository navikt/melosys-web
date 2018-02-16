import person from './person-body';
import arbeidsforhold from './arbeidsforhold-body';
import organiasjoner from './organisasjoner-body';
import medlemskap from './medlemskap-body';
import inntekt from './inntekt-body';

const { Matchers } = require('@pact-foundation/pact');

const { integer, like, eachLike } = Matchers;

const oppsummering = {
  behandlingID: integer(3),
  gsakId: integer(123),
  status: like('OPPRETTET'),
  type: like('SØKNAD'),
  registrertDato: like('2017-10-19T14:35:54'),
};

const saksopplysninger = {
  person,
};
const behandling = {
  oppsummering,
  saksopplysninger,
  arbeidsforhold,
  organiasjoner,
  medlemskap,
  inntekt,
  behandlingshistorikk: [],
};

const behandlinger = eachLike(behandling, {
  min: 1,
});
const fagsak = {
  saksnummer: 4,
  type: 'A1',
  status: 'OPPRETTET',
  registrertDato: '2018-02-01T10:09:39.617',
  behandlinger,
};
export default fagsak;
