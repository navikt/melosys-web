import { Saksbehandler } from '../api';

describe('Saksbehandler endepunkt', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  test('/api/saksbehandler', () => {
    const saksbehandler = {
      brukernavn: 'Z991001',
      navn: 'F_Z991001 E_Z991001',
    };
    fetch.mockResponseOnce(JSON.stringify(saksbehandler));

    // assert on the response
    Saksbehandler.hent().then(res => {
      expect(res.navn).toEqual(saksbehandler.navn);
      expect(res.brukernavn).toEqual(saksbehandler.brukernavn);
    });

    // assert on the times called and arguments given to fetch
    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][0]).toEqual('/api/saksbehandler');
  });
});
