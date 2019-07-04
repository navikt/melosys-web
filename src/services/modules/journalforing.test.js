import { Journalforing } from '../api';

describe('Journalforing endepunkt', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });
  test('GET /api/journalforing/:journalpostID/:oppgaveID', () => {
    const oppgave = {
      brukerID: '30098000492',
      avsenderID: null,
      erBrukerAvsender: true,
      dokument: {
        ID: 'Dok_ID',
        tittel: 'Søknad om medlemskap',
        mottattDato: '2018-05-04T15:15:25.622',
      },
    };
    fetch.mockResponseOnce(JSON.stringify(oppgave));

    const journalpostID = 'DOK_3789';
    // assert on the response
    Journalforing.hent(journalpostID).then(res => {
      expect(res).toEqual(oppgave);
    });

    // assert on the times called and arguments given to fetch
    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][0]).toEqual(`/api/journalforing/${journalpostID}`);
  });

  test('POST /api/journalforing/opprett', () => {
    const oppgave = {
      brukerID: '30098000492',
      avsenderID: '30098000492',
      erBrukerAvsender: true,
      dokument: {
        ID: 'Dok_ID',
        tittel: 'Søknad om medlemskap',
        mottattDato: '2018-05-04T15:15:25.622',
      },
    };
    fetch.mockResponseOnce(JSON.stringify(oppgave));

    // assert on the response
    Journalforing.opprett(oppgave).then(res => {
      expect(res).toEqual(oppgave);
    });
  });
});
