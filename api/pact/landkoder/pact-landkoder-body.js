const { Matchers } = require('@pact-foundation/pact');

const { like, eachLike } = Matchers;
const landkode = {
  kode: like('KODE'),
  term: like('TERM'),
};
const landkoder = eachLike(landkode, {
  min: 1,
});

export default landkoder;
