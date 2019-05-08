const qs = require('qs');

export const getParam = (location, param) => {
  const queryObject = qs.parse(location.search, { ignoreQueryPrefix: true });
  return queryObject[param];
};

export const toObject = location => qs.parse(location.search, { ignoreQueryPrefix: true });
