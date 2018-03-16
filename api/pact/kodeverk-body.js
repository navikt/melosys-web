const { Matchers } = require('@pact-foundation/pact');

const { like } = Matchers;

const kodeverk = {
  kode: like('AVST'),
  term: like('Avslatt'),
};
export default kodeverk;
