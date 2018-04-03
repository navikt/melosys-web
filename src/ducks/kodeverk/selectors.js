/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';

export const kodeverkSelector = createSelector(
  state => state.kodeverk.data,
  kodeverk => kodeverk
);

export const kodeverkLandkoderSelector = createSelector(
  state => state.kodeverk.data.landkoder,
  landkoder => landkoder
);

export const kodeverkBehandlingsStatusSelector = createSelector(
  state => state.kodeverk.data.behandlingsstatus,
  behandlingsstatus => behandlingsstatus
);

export const kodeverkBehandlingsTyperSelector = createSelector(
  state => state.kodeverk.data.behandlingstyper,
  behandlingstyper => behandlingstyper
);

export const kodeverkSakstyperSelector = createSelector(
  state => state.kodeverk.data.sakstyper,
  sakstyper => sakstyper
);
