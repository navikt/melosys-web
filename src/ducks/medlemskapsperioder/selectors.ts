import { RootState, StateSection } from "AppTypes";
import { createSelector, Selector } from "reselect";
import * as Types from "./types";
import MKV from "../../melosyskodeverk";

export const MedlemskapsperioderSelector: Selector<RootState, StateSection<Types.Data>> = createSelector(
  (state: RootState) => state.medlemskapsperioder,
  (medlemskapsperioder) => medlemskapsperioder
);

export const MedlemskapsperioderStatusSelector: Selector<RootState, string> = createSelector(
  MedlemskapsperioderSelector,
  (medlemskapsperioder) => medlemskapsperioder.status
);

export const MedlemskapsperioderDataSelector: Selector<RootState, Types.Data> = createSelector(
  MedlemskapsperioderSelector,
  (medlemskapsperioder) => medlemskapsperioder.data
);

export const AlleMedlemskapsperioderSelector = createSelector(
  MedlemskapsperioderDataSelector,
  (medlemskapsperioder) => medlemskapsperioder.medlemskapsperioder
);

export const SamletInnvilgetMedlemskapsperiodeSelector = createSelector(
  AlleMedlemskapsperioderSelector,
  (medlemskapsperioder) => {
    const sorterteInnvilgedePerioder = [...(medlemskapsperioder || [])]
      .filter((periode) => periode.innvilgelsesResultat === MKV.Koder.innvilgelsesResultat.INNVILGET)
      .sort((a, b) => new Date(a.fomDato!).getTime() - new Date(b.fomDato!).getTime());

    if (sorterteInnvilgedePerioder.length === 0) return undefined;

    return {
      fom: sorterteInnvilgedePerioder[0].fomDato,
      tom: sorterteInnvilgedePerioder[sorterteInnvilgedePerioder.length - 1].tomDato,
    };
  }
);

export const BestemmelseSelector = createSelector(MedlemskapsperioderDataSelector, (medlemskapsperioderData) =>
  medlemskapsperioderData.bestemmelse ? medlemskapsperioderData.bestemmelse : ""
);
