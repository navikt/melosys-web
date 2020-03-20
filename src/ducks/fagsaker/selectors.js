// selector(s)
import { createSelector } from 'reselect';

export const FagsakSelector = createSelector(
  state => (state.fagsaker.data ? state.fagsaker.data : {}),
  fagsak => fagsak
);

export const SaksnummerSelector = createSelector(
  state => (state.fagsaker.data ? state.fagsaker.data.saksnummer : ''),
  saksnummer => saksnummer
);

export const FagsakStatusSelector = createSelector(
  state => (state.fagsaker.data.saksstatus ? state.fagsaker.data.saksstatus.kode : ''),
  fagsakStatus => fagsakStatus
);

export const SakstypeSelector = createSelector(
  FagsakSelector,
  fagsak => fagsak.sakstype
);

export const SakstypeKodeSelector = createSelector(
  SakstypeSelector,
  sakstype => sakstype.kode
);
