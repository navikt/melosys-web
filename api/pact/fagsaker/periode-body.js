const { Matchers } = require('@pact-foundation/pact');

const { iso8601Date } = Matchers;

const periode = {
  fom: iso8601Date('1978-08-19'),
  tom: iso8601Date('1979-07-15'),
};
export default periode;
