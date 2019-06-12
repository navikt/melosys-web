/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';
import { valgteLovvalgsVilkar } from '../vilkar/selectors';

// import * as Koder from '../../kodeverk';

// selector(s)
export const LovvalgsperioderSelector = createSelector(
  state => (state.lovvalgsperioder.data ? state.lovvalgsperioder.data : []),
  lovvalgsperioder => lovvalgsperioder
);

export const LovvalgsperiodeSelector = createSelector(
  state => LovvalgsperioderSelector(state),
  lovvalgsPerioder => (lovvalgsPerioder[0] ? lovvalgsPerioder[0] : {})
);

export const LovvalgBestemmelseSelector = createSelector(
  state => valgteLovvalgsVilkar(state),
  lovvalgsvilkar => (lovvalgsvilkar.length > 0 ? lovvalgsvilkar[0].vilkaar : undefined)
);

export const LovvalgslandSelector = createSelector(
  state => LovvalgsperiodeSelector(state),
  lovvalgsperiode => lovvalgsperiode.lovvalgsland
);

export const UnntakFraBestemmelseSelector = createSelector(
  state => LovvalgsperiodeSelector(state),
  lovvalgsperiode => lovvalgsperiode.unntakFraBestemmelse
);

export const MedlemskapsperiodeIDSelector = createSelector(
  state => LovvalgsperiodeSelector(state),
  lovvalgsperiode => lovvalgsperiode.medlemskapsperiodeID
);

export const PeriodeSelector = createSelector(
  LovvalgsperiodeSelector,
  lovvalgsperiode => ({ fom: lovvalgsperiode.fomDato, tom: lovvalgsperiode.tomDato })
);

export const InnvilgelsesResultatSelector = createSelector(
  LovvalgsperiodeSelector,
  lovvalgsperiode => lovvalgsperiode.innvilgelsesResultat
)
