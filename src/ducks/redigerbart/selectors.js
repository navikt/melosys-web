import { createSelector } from "reselect";

import { anmodningsperioderSelectors } from "../anmodningsperioder";
import { behandlingerSelectors } from "../behandlinger";

export const RedigerbartSelector = createSelector(
  (state) => behandlingerSelectors.BehandlingerSelector(state).redigerbart || false,
  (redigerbart) => redigerbart
);
export const EndreLovvalgsPeriodeRedigerbartSelector = createSelector(
  (state) => behandlingerSelectors.BehandlingerSelector(state).redigerbart || false,
  (redigerbart) => redigerbart
);
export const GeneriskStegRedigerbartSelector = createSelector(
  RedigerbartSelector,
  anmodningsperioderSelectors.AlleAnmodningsperioderSendtUtlandSelector,
  (redigerbart, erArtikkel16AnmodningSendt) => redigerbart && !erArtikkel16AnmodningSendt
);
export const PanelerRedigerbartSelector = createSelector(
  RedigerbartSelector,
  anmodningsperioderSelectors.AlleAnmodningsperioderSendtUtlandSelector,
  behandlingerSelectors.ErEndretPeriodeSelector,
  behandlingerSelectors.ErAnmodningOmUnntakHovedRegelSelector,
  behandlingerSelectors.ErRegistreringUnntakNorskTrygdUtstasjoneringSelector,
  behandlingerSelectors.ErRegistreringUnntakNorskTrygdOvrigeSelector,
  (
    redigerbart,
    erArtikkel16AnmodningSendt,
    erEndretPeriode,
    erBehandleAnmodningOmUnntak,
    erRegistreringUnntakNorskTrygdUtstasjonering,
    erRegistreringUnntakNorskTrygdOvrige
  ) =>
    !erEndretPeriode &&
    !erBehandleAnmodningOmUnntak &&
    !erRegistreringUnntakNorskTrygdUtstasjonering &&
    !erRegistreringUnntakNorskTrygdOvrige &&
    redigerbart &&
    !erArtikkel16AnmodningSendt
);

export const BehandlingsmenyRedigerbartSelector = createSelector(
  RedigerbartSelector,
  behandlingerSelectors.ErStatusAnmodningUnntakSendtSelector,
  behandlingerSelectors.ErEndretPeriodeSelector,
  (redigerbart, erStatusAnmodningunntakSendt, erEndretPeriode) =>
    erEndretPeriode || erStatusAnmodningunntakSendt || redigerbart
);
export const ModalHenleggRedigerbartSelector = createSelector(
  BehandlingsmenyRedigerbartSelector,
  (redigerbart) => redigerbart
);
export const ModalAvsluttSomBortfaltRedigerbartSelector = createSelector(
  BehandlingsmenyRedigerbartSelector,
  (redigerbart) => redigerbart
);
export const ModalFerdigbehandleSakRedigerbartSelector = createSelector(
  BehandlingsmenyRedigerbartSelector,
  (redigerbart) => redigerbart
);
