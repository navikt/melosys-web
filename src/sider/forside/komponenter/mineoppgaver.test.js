import { sortBehandlinger } from './mineoppgaver';

describe('Mineoppgaver', () => {
  it('sortBehandlinger', () => {
    const forsteOppgave = { behandling: { registrertDato: '2019-12-11T16:30:00.622Z' } };
    const andreOppgave = { behandling: { registrertDato: '2019-12-11T16:30:01.622Z' } };

    const sortBehandlingerDescending = sortBehandlinger('descending');
    const sortBehandlingerAscending = sortBehandlinger('ascending');

    expect(sortBehandlingerDescending(forsteOppgave, andreOppgave)).toBeGreaterThan(0);
    expect(sortBehandlingerDescending(andreOppgave, forsteOppgave)).toBeLessThan(0);
    expect(sortBehandlingerAscending(forsteOppgave, andreOppgave)).toBeLessThan(0);
    expect(sortBehandlingerAscending(andreOppgave, forsteOppgave)).toBeGreaterThan(0);
  });
});
