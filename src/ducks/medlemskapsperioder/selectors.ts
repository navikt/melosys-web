import { RootState, StateSection } from "AppTypes";
import { createSelector, Selector } from "reselect";
import * as Types from "./types";
import MKV from "../../melosyskodeverk";
import { sorterEtterISOFomDato } from "../../utils/dato";
import { hasInnvilgelsesResultat } from "../../services/modules/medlemavfolketrygden/medlemskapsperioder";

const { DELVIS_INNVILGET, INNVILGET } = MKV.Koder.innvilgelsesResultat;

export const MedlemskapsperioderSelector: Selector<RootState, StateSection<Types.Data>> = createSelector(
  (state: RootState) => state.medlemskapsperioder,
  (medlemskapsperioder) => medlemskapsperioder,
);

export const MedlemskapsperioderStatusSelector: Selector<RootState, string> = createSelector(
  MedlemskapsperioderSelector,
  (medlemskapsperioder) => medlemskapsperioder.status,
);

export const MedlemskapsperioderDataSelector: Selector<RootState, Types.Data> = createSelector(
  MedlemskapsperioderSelector,
  (medlemskapsperioder) => medlemskapsperioder.data,
);

export const AlleMedlemskapsperioderSelector = createSelector(
  MedlemskapsperioderDataSelector,
  (medlemskapsperioder) => medlemskapsperioder.medlemskapsperioder || [],
);

export const InnvilgetEllerDelvisInnvilgetMedlemskapsperioderSelector = createSelector(
  AlleMedlemskapsperioderSelector,
  (medlemskapsperioder) =>
    medlemskapsperioder.filter(
      (periode) =>
        hasInnvilgelsesResultat(periode) &&
        (periode.innvilgelsesResultat === INNVILGET || periode.innvilgelsesResultat === DELVIS_INNVILGET),
    ),
);

export const SamletInnvilgetMedlemskapsperiodeSelector = createSelector(
  AlleMedlemskapsperioderSelector,
  (medlemskapsperioder) => {
    const sorterteInnvilgedePerioder = [...medlemskapsperioder]
      .filter((periode) => hasInnvilgelsesResultat(periode) && periode.innvilgelsesResultat === INNVILGET)
      .sort(sorterEtterISOFomDato);

    if (sorterteInnvilgedePerioder.length === 0) return undefined;

    return {
      fom: sorterteInnvilgedePerioder[0].fomDato,
      tom: sorterteInnvilgedePerioder[sorterteInnvilgedePerioder.length - 1].tomDato,
    };
  },
);

export const BestemmelseSelector = createSelector(AlleMedlemskapsperioderSelector, (medlemskapsperioder) => {
  const sorterte = [...medlemskapsperioder].sort(sorterEtterISOFomDato);
  const forstePeriode = sorterte[0];
  return forstePeriode && hasInnvilgelsesResultat(forstePeriode) ? forstePeriode.bestemmelse : "";
});
