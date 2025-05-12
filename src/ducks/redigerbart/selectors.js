import { createSelector } from "reselect";

import { anmodningsperioderSelectors } from "../anmodningsperioder";
import { behandlingerSelectors } from "../behandlinger";

/**
 * @type {import('reselect').Selector<import('../../AppTypes').RootState, boolean>}
 */
export const RedigerbartSelector = createSelector(
  /** @param {import('../../AppTypes').RootState} state */
  (state) =>
    state.behandlinger.data && state.behandlinger.data.redigerbart !== undefined
      ? state.behandlinger.data.redigerbart
      : false,
  (redigerbart) => redigerbart,
);

/**
 * @type {import('reselect').Selector<import('../../AppTypes').RootState, boolean>}
 */
export const EndreLovvalgsPeriodeRedigerbartSelector = createSelector(
  /** @param {import('../../AppTypes').RootState} state */
  (state) =>
    state.behandlinger.data && state.behandlinger.data.redigerbart !== undefined
      ? state.behandlinger.data.redigerbart
      : false,
  (redigerbart) => redigerbart,
);

export const GeneriskStegRedigerbartSelector = createSelector(
  RedigerbartSelector,
  anmodningsperioderSelectors.AlleAnmodningsperioderSendtUtlandSelector,
  (redigerbart, erArtikkel16AnmodningSendt) => redigerbart && !erArtikkel16AnmodningSendt,
);

export const PanelerRedigerbartSelector = createSelector(
  RedigerbartSelector,
  anmodningsperioderSelectors.AlleAnmodningsperioderSendtUtlandSelector,
  behandlingerSelectors.ErEndretPeriodeSelector,
  behandlingerSelectors.ErAnmodningOmUnntakHovedRegelOgHarFlytSelector,
  behandlingerSelectors.ErRegistreringUnntakNorskTrygdUtstasjoneringSelector,
  behandlingerSelectors.ErRegistreringUnntakNorskTrygdOvrigeSelector,
  (
    redigerbart,
    erArtikkel16AnmodningSendt,
    erEndretPeriode,
    erBehandleAnmodningOmUnntak,
    erRegistreringUnntakNorskTrygdUtstasjonering,
    erRegistreringUnntakNorskTrygdOvrige,
  ) =>
    !erEndretPeriode &&
    !erBehandleAnmodningOmUnntak &&
    !erRegistreringUnntakNorskTrygdUtstasjonering &&
    !erRegistreringUnntakNorskTrygdOvrige &&
    redigerbart &&
    !erArtikkel16AnmodningSendt,
);
