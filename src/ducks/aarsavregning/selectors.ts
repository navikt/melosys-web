/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector, Selector } from "reselect";
import { RootState } from "AppTypes";
import { AarsavregningResponse, Trygdeavgiftsgrunnlag } from "../../services/modules/aarsavregning/aarsavregning";
import { Avgiftspliktigperiode } from "../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import { AarsavregningState } from "./types";

const AarsavregningSelector: Selector<RootState, AarsavregningState> = createSelector(
  (state: RootState) => state.aarsavregning,
  (aarsavregning) => aarsavregning,
);

const AarsavregningDataSelector: Selector<RootState, AarsavregningResponse> = createSelector(
  AarsavregningSelector,
  (aarsavregning) => aarsavregning.data,
);

export const AarsavregningAarSelector: Selector<RootState, number | undefined> = createSelector(
  AarsavregningDataSelector,
  (aarsavregning) => aarsavregning.aar,
);

const AarsavregningTidligereGrunnlagSelector: Selector<RootState, Trygdeavgiftsgrunnlag | undefined> = createSelector(
  AarsavregningDataSelector,
  (aarsavregning) => aarsavregning?.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag,
);

export const AarsavregningTidligereGrunnlagMedlemskapsperioderSelector: Selector<RootState, Avgiftspliktigperiode[]> =
  createSelector(AarsavregningTidligereGrunnlagSelector, (tidligereGrunnlag) =>
    tidligereGrunnlag ? tidligereGrunnlag.avgiftspliktigperioder : [],
  );

export const ErNyVurderingSelector: Selector<RootState, boolean> = createSelector(
  AarsavregningSelector,
  (aarsavregning) => aarsavregning.erNyVurdering ?? false,
);
