const { Matchers } = require('@pact-foundation/pact');

const { like } = Matchers;

const landkoder = [{
  kode: like('KODE'),
  term: like('TERM'),
}];

export default landkoder;
