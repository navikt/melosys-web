/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';

/* eslint import/prefer-default-export:"off" */
export const BehandlingsresultatSelector = createSelector(
  state => (state.behandlingsresultat ? state.behandlingsresultat.data : []),
  behandlingsresultat => behandlingsresultat
);

export const VedtakstypeSelector = createSelector(
  BehandlingsresultatSelector,
  behandlingsresultat => behandlingsresultat.vedtakstype
);

export const BegrunnelseKoderSelector = createSelector(
  BehandlingsresultatSelector,
  behandlingsresultat => behandlingsresultat.begrunnelseKoder
);

export const BegrunnelseFritekstSelector = createSelector(
  BehandlingsresultatSelector,
  behandlingsresultat => behandlingsresultat.begrunnelseFritekst
);

export const KontrollresultatBegrunnelseKoderSelector = createSelector(
  BehandlingsresultatSelector,
  behandlingsresultat => behandlingsresultat.kontrollresultatBegrunnelseKoder
);

export const UtfallRegistreringUnntak = createSelector(
  BehandlingsresultatSelector,
  behandlingsresultat => behandlingsresultat.utfallRegistreringUnntak
);
