/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';

import MKV from '../../melosyskodeverk';
import { BehandlingstemaKodeSelector } from '../behandlinger/selectors';

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

const UtfallRegistreringUnntakSelector = createSelector(
  BehandlingsresultatSelector,
  behandlingsresultat => behandlingsresultat.utfallRegistreringUnntak
);

const UtfallUtpekingSelector = createSelector(
  BehandlingsresultatSelector,
  behandlingsresultat => behandlingsresultat.utfallUtpeking
);

export const UtpekingVurderingSelector = createSelector(
  state => BehandlingstemaKodeSelector(state),
  UtfallRegistreringUnntakSelector,
  UtfallUtpekingSelector,
  (behandlingstema, utfallRegistreringUnntak, utfallUtpeking) => (
    behandlingstema === MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND
      ? utfallRegistreringUnntak
      : utfallUtpeking
  )
);
