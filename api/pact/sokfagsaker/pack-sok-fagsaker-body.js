const { Matchers } = require('@pact-foundation/pact');

const {
  integer, like, eachLike, term,
} = Matchers;

const fagsak = {
  saksnummer: integer(3),
  fnr: like('1234567890'),
  sammensattNavn: like('LILLA HEST'),
  type: like('A1'),
  status: like('OPPRETTET'),
  registrertDato: like('2017-10-19T12:31:36'),
  kjoenn: term({
    matcher: 'M|K',
    generate: 'K',
  }),
};
const sokfagsaker = eachLike(fagsak, {
  min: 1,
});
export default sokfagsaker;
