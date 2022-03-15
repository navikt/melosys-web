import { RootState } from "AppTypes";
import { createSelector } from "reselect";

import MKV from "../../../../melosyskodeverk";

import { formSelectors } from "../../../../ducks/form";

const { LØNN_FRA_NORGE, LØNN_FRA_UTLANDET, DELT_LØNN } = MKV.Koder.loenn_forhold;

export const LonnsforholdErNorgeEllerDelt = createSelector(
  (state: RootState) => formSelectors.VurderTrygdeavgiftFormSelector(state),
  (trygdeavgift) => [LØNN_FRA_NORGE, DELT_LØNN].includes(trygdeavgift.values?.avgiftsgrunnlag?.lønnsforhold)
);

export const LonnsforholdErUtlandetEllerDelt = createSelector(
  (state: RootState) => formSelectors.VurderTrygdeavgiftFormSelector(state),
  (trygdeavgift) => [LØNN_FRA_UTLANDET, DELT_LØNN].includes(trygdeavgift.values?.avgiftsgrunnlag?.lønnsforhold)
);
