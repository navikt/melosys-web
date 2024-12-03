import { createSelector } from "reselect";
import MKV from "../../melosyskodeverk";
import * as KV from "../../kodeverk";

export const UtpekingsperioderSelector = createSelector(
  (state) => (state.utpekingsperioder.data ? state.utpekingsperioder.data : []),
  (utpekingsperioder) => utpekingsperioder,
);

export const UtpekingsperiodeSelector = createSelector(
  UtpekingsperioderSelector,
  (utpekingsperioder) => utpekingsperioder[0] || {},
);

export const LovvalgslandSelector = createSelector(
  UtpekingsperiodeSelector,
  (utpekingsperiode) => utpekingsperiode.lovvalgsland,
);

export const LovvalgslandKTSelector = createSelector(LovvalgslandSelector, (lovvalgsland) =>
  KV.kodeTilObjekt(lovvalgsland, MKV.KTObjects.landkoder),
);

export const FomDatoSelector = createSelector(UtpekingsperiodeSelector, (utpekingsperiode) => utpekingsperiode.fomDato);

export const TomDatoSelector = createSelector(UtpekingsperiodeSelector, (utpekingsperiode) => utpekingsperiode.tomDato);
