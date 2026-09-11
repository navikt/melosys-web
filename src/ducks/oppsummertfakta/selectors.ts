import { createSelector, Selector } from "reselect";
import { RootState, StateSection } from "AppTypes";
import MKV from "../../melosyskodeverk";
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

export const ManglendeInnbetalingHandlingsvalgSelector = createSelector(
  OppsummertFaktaDataSelector,
  (oppsummertfakta) => oppsummertfakta.manglendeInnbetalingHandlingsvalg,
);

export const ErDelvisOpphørValgtSelector = createSelector(
  ManglendeInnbetalingHandlingsvalgSelector,
  (manglendeInnbetalingHandlingsvalg) =>
    manglendeInnbetalingHandlingsvalg?.kode === MKV.Koder.manglendeInnbetalingHandlingsvalg.DELER_AV_PERIODEN_OPPHØRES,
);

export const ErVedtaketSkalEndresValgtSelector = createSelector(
  ManglendeInnbetalingHandlingsvalgSelector,
  (manglendeInnbetalingHandlingsvalg) =>
    manglendeInnbetalingHandlingsvalg?.kode === MKV.Koder.manglendeInnbetalingHandlingsvalg.VEDTAKET_SKAL_ENDRES,
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
