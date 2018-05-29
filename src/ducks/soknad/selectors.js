import { createSelector } from 'reselect';

/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

export const SoknadSelector = createSelector(
  state => state.soknad.data.soknadDokument && state.soknad.data,
  soknad => soknad
);

export const ArbeidNorgeSelector = createSelector(
  state => (state.soknad.data.soknadDokument ? state.soknad.data.soknadDokument.arbeidNorge : {}),
  arbeidNorge => arbeidNorge || {}
);

export const ArbeidUtlandSelector = createSelector(
  state => (state.soknad.data.soknadDokument ? state.soknad.data.soknadDokument.oppholdUtland : {}),
  soknad => soknad || {}
);

export const ArbeidsinntektSelector = createSelector(
  state => (state.soknad.data.soknadDokument ? state.soknad.data.soknadDokument.arbeidsinntekt : {}),
  soknad => soknad || {}
);

export const ForetakUtlandSelector = createSelector(
  state => state.soknad.data.soknadDokument && state.soknad.data.soknadDokument.foretakUtland,
  soknad => soknad || {}
);

export const JuridiskArbeidsgiverNorgeSelector = createSelector(
  state => state.soknad.data.soknadDokument && state.soknad.data.soknadDokument.juridiskArbeidsgiverNorge,
  soknad => soknad || {}
);

export const OppholdUtlandSelector = createSelector(
  state => (state.soknad.data.soknadDokument ? state.soknad.data.soknadDokument.oppholdUtland : {}),
  soknad => soknad || {}
);

export const BostedSelector = createSelector(
  state => (state.soknad.data.soknadDokument ? state.soknad.data.soknadDokument.bosted : {}),
  bosted => bosted || {}
);

export const ArbeidsgiversBekreftelseSelector = createSelector(
  state => (state.soknad.data.soknadDokument ? state.soknad.data.soknadDokument.arbeidsgiversBekreftelse : {}),
  soknad => soknad || {}
);
