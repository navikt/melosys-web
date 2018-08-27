// from .env or .env.local
// eslint-disable-next-line import/prefer-default-export
export const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}`;
/* eslint-disable no-console */
console.log('api-constants', `${process.env.REACT_APP_API_BASE_URL}`);
/* eslint-enable no-console */
