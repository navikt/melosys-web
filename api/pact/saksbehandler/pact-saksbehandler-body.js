const { Matchers } = require('@pact-foundation/pact');

const { like } = Matchers;

const saksbehandler = {
  brukernavn: like('BRUKERNAVN'),
  navn: like('NAVN'),
};

export default saksbehandler;
