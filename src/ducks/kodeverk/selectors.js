/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';


export const landkoderSelector = createSelector(
  state => state.kodeverk.data.landkoder,
  landkoder => landkoder
);

export const behandlingsStatusSelector = createSelector(
  state => state.kodeverk.data.behandlingsstatus,
  behandlingsstatus => behandlingsstatus
);

export const behandlingsTyperSelector = createSelector(
  state => state.kodeverk.data.behandlingstyper,
  behandlingstyper => behandlingstyper
);

export const sakstyperSelector = createSelector(
  state => state.kodeverk.data.sakstyper,
  sakstyper => sakstyper
);

export const dokumenttitlerSelector = createSelector(
  state => state.kodeverk.data.dokumenttitler,
  dokumenttitler => dokumenttitler || []
);

export const vedleggstitlerSelector = createSelector(
  state => state.kodeverk.data.vedleggstitler,
  vedleggstitler => vedleggstitler || []
);
