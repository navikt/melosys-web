import { createSelector } from "reselect";

export const ModalerSelector = createSelector(
  (state) => state.modaler.data,
  (modaler) => modaler
);

export const AvslagSoknadSelector = createSelector(ModalerSelector, (modaler) => modaler.avslagSoknad);

export const ErAvslagSoknadSynligSelector = createSelector(AvslagSoknadSelector, (avslagSoknad) => avslagSoknad.synlig);

export const BekreftValgSelector = createSelector(ModalerSelector, (modaler) => modaler.bekreftValg);

export const ErBekreftValgSynligSelector = createSelector(BekreftValgSelector, (bekreftValg) => bekreftValg.synlig);

export const BekreftValgTypeSelector = createSelector(BekreftValgSelector, (bekreftValg) => bekreftValg.type);

export const HenleggSelector = createSelector(ModalerSelector, (modaler) => modaler.henlegg);

export const ErHenleggSynligSelector = createSelector(HenleggSelector, (henlegg) => henlegg.synlig);

export const OppfriskSelector = createSelector(ModalerSelector, (modaler) => modaler.oppfrisk);

export const ErOppfriskSynligSelector = createSelector(OppfriskSelector, (oppfrisk) => oppfrisk.synlig);

export const BehandlingUnderOppfriskningSelector = createSelector(
  OppfriskSelector,
  (oppfrisk) => oppfrisk.behandlingUnderOppfriskning
);
