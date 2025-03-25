import { createSelector, Selector } from "reselect";
import { RootState, StateSection } from "AppTypes";
import * as Types from "./types";

export const OppsummertFaktaSelector: Selector<RootState, StateSection<Types.Data>> = createSelector(
  (state: RootState) => state.oppsummertfakta,
  (oppsummertfakta) => oppsummertfakta,
);

export const OppsummertFaktaDataSelector: Selector<RootState, Types.Data> = createSelector(
  OppsummertFaktaSelector,
  (oppsummertfakta) => oppsummertfakta.data,
);

export const VirksomheterSelector = createSelector(
  OppsummertFaktaDataSelector,
  (oppsummertfakta) => oppsummertfakta.virksomheter,
);

export const VirksomhetIDerSelector = createSelector(VirksomheterSelector, (virksomheter) =>
  virksomheter ? virksomheter.virksomhetIDer : [],
);

export const FullstendigManglendeInnbetalingSelector = createSelector(
  OppsummertFaktaDataSelector,
  (oppsummertfakta) => oppsummertfakta.fullstendigManglendeInnbetaling,
);

export const IkkeYrkesaktivRelasjonSelector = createSelector(
  OppsummertFaktaDataSelector,
  (oppsummertfakta) => oppsummertfakta.ikkeYrkesaktivFamilieRelasjonstype,
);

export const ArbeidssituasjonSelector = createSelector(
  OppsummertFaktaDataSelector,
  (oppsummertfakta) => oppsummertfakta.arbeidssituasjonType,
);

export const UkjentSluttdatoMedlemskapsperiodeSelector = createSelector(
  OppsummertFaktaDataSelector,
  (oppsummertfakta) => oppsummertfakta.ukjentSluttdatoMedlemskapsperiode,
);

export const IkkeYrkesaktivOppholdSelector = createSelector(
  OppsummertFaktaDataSelector,
  (oppsummertfakta) => oppsummertfakta.ikkeYrkesaktivOppholdstype,
);

export const BetalingsvalgSelector = createSelector(
  OppsummertFaktaDataSelector,
  (oppsummertfakta) => oppsummertfakta.betalingstype,
);
