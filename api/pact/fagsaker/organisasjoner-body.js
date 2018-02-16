const { Matchers } = require('@pact-foundation/pact');

const { like, eachLike } = Matchers;


const organisasjon = {
  orgnr: like('912499693'),
  navn: like('NAVN'),
  postadresse: like({
    gateadresse: like({
      gatenavn: like('GATENAVN'),
    }),
    postnr: like('3202'),
    land: like('NO'),
  }),
};

const organisasjoner = eachLike(organisasjon);

export default organisasjoner;
