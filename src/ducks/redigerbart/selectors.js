import { createSelector } from 'reselect';

import * as MKV from 'melosys-kodeverk';

import { avklartefaktaSelectors } from '../avklartefakta';
import { behandlingerSelectors } from '../behandlinger';

export const RedigerbartSelector = createSelector(
  state => behandlingerSelectors.BehandlingerSelector(state).redigerbart || false,
  behandlingerSelectors.BehandlingstypeKodeSelector,
  (redigerbart, behandlingstypeKode) => redigerbart && behandlingstypeKode !== MKV.Koder.behandlinger.typer.ENDRET_PERIODE
);
export const EndreLovvalgsPeriodeRedigerbartSelector = createSelector(
  state => behandlingerSelectors.BehandlingerSelector(state).redigerbart || false,
  redigerbart => redigerbart
);
export const GeneriskStegRedigerbartSelector = createSelector(
  RedigerbartSelector,
  behandlingerSelectors.ErArtikkel16AnmodningSendtSelector,
  (redigerbart, erArtikkel16AnmodningSendt) => redigerbart && !erArtikkel16AnmodningSendt
);
export const PanelerRedigerbartSelector = createSelector(
  RedigerbartSelector,
  behandlingerSelectors.ErArtikkel16AnmodningSendtSelector,
  (redigerbart, erArtikkel16AnmodningSendt) => redigerbart && !erArtikkel16AnmodningSendt
);
export const SidedialogRedigerbartSelector = createSelector(
  RedigerbartSelector,
  behandlingerSelectors.ErArtikkel16AnmodningSendtSelector,
  (redigerbart, erArtikkel16AnmodningSendt) => redigerbart && !erArtikkel16AnmodningSendt
);
export const ErIArtikkel13_1FlytSelector = () => false;
export const BrevBestillingRedigerbartSelector = createSelector(
  SidedialogRedigerbartSelector,
  ErIArtikkel13_1FlytSelector,
  avklartefaktaSelectors.AvklarteVirksomheterSelector,
  (sideDialogRedigerbart, erIArtikkel13_1Flyt, avklarteVirksomheter) => sideDialogRedigerbart && !erIArtikkel13_1Flyt && avklarteVirksomheter.length === 1
);
export const SedBestillingRedigerbartSelector = createSelector(
  SidedialogRedigerbartSelector,
  ErIArtikkel13_1FlytSelector,
  sideDialogRedigerbart => sideDialogRedigerbart
);
