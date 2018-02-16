const { Matchers } = require('@pact-foundation/pact');

const { integer, like, term } = Matchers;

const gateadresse = {
  gatenavn: like('GATENAVN'),
  gatenummer: like(0),
  husnummer: like(123),
  husbokstav: like('A'),
};

const bostedsadresse = {
  gateadresse,
  postnr: like('5000'),
  land: like('NOR'),
};

const person = {
  fnr: integer('12345123451'),
  sivilstand: like('Gift'),
  statsborgerskap: like('NOR'),
  sammensattNavn: like('LILLA HEST'),
  bostedsadresse,
  kjoenn: term({
    matcher: 'M|K',
    generate: 'K',
  }),
  foedselsdato: like('1963-05-05'),
};
export default person;
