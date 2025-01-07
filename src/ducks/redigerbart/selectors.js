import { createSelector } from "reselect";

import { anmodningsperioderSelectors } from "../anmodningsperioder";
import { behandlingerSelectors } from "../behandlinger";

export const RedigerbartSelector = createSelector(
  (state) => behandlingerSelectors.BehandlingerSelector(state).redigerbart || false,
  (redigerbart) => redigerbart,
);
export const EndreLovvalgsPeriodeRedigerbartSelector = createSelector(
  (state) => behandlingerSelectors.BehandlingerSelector(state).redigerbart || false,
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
