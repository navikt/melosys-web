/* eslint-disable camelcase */
const host = 'http://localhost';
const port = {
  SAKSBEHANDLER: 8990,
  LANDKODER: 8991,
  SOK_FAGSAKER: 8992,
  FAGSAKER: 8993,
  FAKTAAVKLARING: 8994,
  VURDERING: 8995,
  SOKNADER: 8996,
};
const API_BASE_URL = '/api/';
const pact_config = {
  spec: 2,
  consumer_name: 'melosys-web',
  provider_name: 'melosys-api',
  pactfileWriteMode: 'merge',
  log: {
    dir: 'logs',
    logfile: 'mockserver-integration.log',
  },
  dir: 'pacts',
}
const MOCK_ENV = {
  PACT_CONFIG: pact_config,
  SAKSBEHANDLER: {
    host,
    port: port.SAKSBEHANDLER,
    path: `${API_BASE_URL}saksbehandler`,
  },
  LANDKODER: {
    host,
    port: port.LANDKODER,
    path: `${API_BASE_URL}landkoder`,
  },
  SOK_FAGSAKER: {
    host,
    port: port.SOK_FAGSAKER,
    path: `${API_BASE_URL}sok/fagsaker`,
  },
  FAGSAKER: {
    host,
    port: port.FAGSAKER,
    path: `${API_BASE_URL}fagsaker`,
  },
  FAKTAAVKLARING: {
    host,
    port: port.FAKTAAVKLARING,
    path: `${API_BASE_URL}faktaavklaring`,
  },
  VURDERING: {
    host,
    port: port.VURDERING,
    path: `${API_BASE_URL}vurdering`,
  },
  SOKNADER: {
    host,
    port: port.SOKNADER,
    path: `${API_BASE_URL}soknader`,
  },
};
export {
  API_BASE_URL,
  MOCK_ENV,
};
