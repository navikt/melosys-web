// selector(s)
import { createSelector } from "reselect";

/** @type {import('reselect').Selector<import('../../AppTypes').RootState, import('../../services/api').Fagsak>} */
export const FagsakSelector = createSelector(
  /** @param {import('../../AppTypes').RootState} state */
  (state) => (state.fagsaker.data ? state.fagsaker.data : {}),
  (fagsak) => fagsak,
);

/** @type {import('reselect').Selector<import('../../AppTypes').RootState, string>} */
export const SaksnummerSelector = createSelector(
  /** @param {import('../../AppTypes').RootState} state */
  (state) => (state.fagsaker.data ? state.fagsaker.data.saksnummer : ""),
  (saksnummer) => saksnummer,
);

export const FagsakStatusSelector = createSelector(
  (state) => (state.fagsaker.data.saksstatus ? state.fagsaker.data.saksstatus.kode : ""),
  (fagsakStatus) => fagsakStatus,
);

export const SakstypeSelector = createSelector(
  (state) => FagsakSelector(state),
  (fagsak) => fagsak.sakstype,
);

export const SakstypeKodeSelector = createSelector(
  (state) => SakstypeSelector(state),
  (sakstype) => (sakstype ? sakstype.kode : ""),
);

export const SakstemaSelector = createSelector(
  (state) => FagsakSelector(state),
  (fagsak) => fagsak.sakstema,
);

export const SakstemaKodeSelector = createSelector(
  (state) => SakstemaSelector(state),
  (sakstema) => (sakstema ? sakstema.kode : ""),
);

export const SakstemaerSelector = createSelector(
  (state) => FagsakSelector(state),
  (fagsak) => (fagsak.muligeSakstemaer ? fagsak.muligeSakstemaer : []),
);

export const SakstyperSelector = createSelector(
  (state) => FagsakSelector(state),
  (fagsak) => (fagsak.muligeSakstyper ? fagsak.muligeSakstyper : []),
);

export const HovedpartRolleSelector = createSelector(
  (state) => FagsakSelector(state),
  (fagsak) => fagsak.hovedpartRolle || "",
);
