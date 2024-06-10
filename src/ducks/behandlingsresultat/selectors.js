/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from "reselect";

import * as Utils from "../../services/utils";

export const BehandlingsresultatSelector = createSelector(
  (state) => state.behandlingsresultat.data || {},
  (behandlingsresultat) => behandlingsresultat
);

const BehandlingsresultatStatusSelector = createSelector(
  (state) => state.behandlingsresultat.status,
  (behandlingsresultatStatus) => behandlingsresultatStatus
);

export const BehandlingsresultatStatusErOkSelector = createSelector(
  BehandlingsresultatStatusSelector,
  (behandlingsresultatStatus) => behandlingsresultatStatus === Utils.STATUS.OK
);

export const BehandlingsresultatTypeSelector = createSelector(
  (state) => BehandlingsresultatSelector(state),
  (behandlingsresultat) => behandlingsresultat.behandlingsresultatTypeKode
);

export const VedtakstypeSelector = createSelector(
  (state) => BehandlingsresultatSelector(state),
  (behandlingsresultat) => behandlingsresultat.vedtakstype
);

export const BegrunnelseKoderSelector = createSelector(
  (state) => BehandlingsresultatSelector(state),
  (behandlingsresultat) => behandlingsresultat.begrunnelseKoder
);

export const BegrunnelseFritekstSelector = createSelector(
  (state) => BehandlingsresultatSelector(state),
  (behandlingsresultat) => behandlingsresultat.begrunnelseFritekst
);

export const InnledningFritekstSelector = createSelector(
  (state) => BehandlingsresultatSelector(state),
  (behandlingsresultat) => behandlingsresultat.innledningFritekst
);

export const TrygdeavgiftFritekstSelector = createSelector(
  (state) => BehandlingsresultatSelector(state),
  (behandlingsresultat) => behandlingsresultat.trygdeavgiftFritekst
);

export const NyVurderingBakgrunnSelector = createSelector(
  (state) => BehandlingsresultatSelector(state),
  (behandlingsresultat) => behandlingsresultat.nyVurderingBakgrunn
);

export const KontrollresultatBegrunnelseKoderSelector = createSelector(
  BehandlingsresultatSelector,
  (behandlingsresultat) => behandlingsresultat.kontrollresultatBegrunnelseKoder
);

export const UtfallRegistreringUnntakSelector = createSelector(
  (state) => BehandlingsresultatSelector(state),
  (behandlingsresultat) => behandlingsresultat.utfallRegistreringUnntak
);

export const UtfallUtpekingSelector = createSelector(
  (state) => BehandlingsresultatSelector(state),
  (behandlingsresultat) => behandlingsresultat.utfallUtpeking
);

export const fakturaserieReferanseSelector = createSelector(
  (state) => BehandlingsresultatSelector(state),
  (behandlingsresultat) => behandlingsresultat.fakturaserieReferanse
);
