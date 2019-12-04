import { createSelector } from 'reselect';

import MKV from '../../melosyskodeverk';

import { avklartefaktaSelectors } from '../avklartefakta';
import { behandlingerSelectors } from '../behandlinger';
import { formSelectors } from '../form';

export const RedigerbartSelector = createSelector(
  state => behandlingerSelectors.BehandlingerSelector(state).redigerbart || false,
  behandlingerSelectors.BehandlingstypeKodeSelector,
  (redigerbart, behandlingstypeKode) => redigerbart && behandlingstypeKode !== MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE
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
export const BrevBestillingRedigerbartSelector = createSelector(
  SidedialogRedigerbartSelector,
  sideDialogRedigerbart => sideDialogRedigerbart
);
export const BrevBestillingRedigerbartIArtikkel13Selector = createSelector(
  avklartefaktaSelectors.ErIArtikkel13_1FlytSelector,
  avklartefaktaSelectors.EnVirksomhetErAvklartSelector,
  formSelectors.BrevBestillingFormSelector,
  (erIArtikkel13_1Flyt, enVirksomhetErAvklart, brevBestillingForm) => {
    const { values: { mottaker } = {} } = brevBestillingForm;

    return !erIArtikkel13_1Flyt || enVirksomhetErAvklart || mottaker !== MKV.Koder.aktoersroller.ARBEIDSGIVER;
  }
);
