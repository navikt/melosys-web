import { createSelector } from 'reselect';
import MKV from '../../melosyskodeverk';

export const UtpekingsperioderSelector = createSelector(
  state => (state.utpekingsperioder.data ? state.utpekingsperioder.data : []),
  utpekingsperioder => utpekingsperioder
);

export const UtpekingsperiodeSelector = createSelector(
  UtpekingsperioderSelector,
  utpekingsperioder => utpekingsperioder[0] || {}
);

export const LovvalgslandSelector = createSelector(
  UtpekingsperiodeSelector,
  utpekingsperiode => utpekingsperiode.lovvalgsland
);

export const LovvalgslandKTSelector = createSelector(
  LovvalgslandSelector,
  lovvalgsland => MKV.KTObjects.landkoder.filter(landkodeObjekt => lovvalgsland === landkodeObjekt.kode)
);
