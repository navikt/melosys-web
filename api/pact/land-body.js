const { Matchers } = require('@pact-foundation/pact');

const { like, eachLike } = Matchers;
const land = eachLike(like('GB'), { min: 1 });
export default land;
