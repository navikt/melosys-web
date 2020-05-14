import { createSelector } from 'reselect';

export const ModalerSelector = createSelector(
  state => state.modaler.data,
  modaler => modaler
);

export const AvslagSoknadSelector = createSelector(
  ModalerSelector,
  modaler => modaler.avslagSoknad
);

export const ErAvslagSoknadSynligSelector = createSelector(
  AvslagSoknadSelector,
  avslagSoknad => avslagSoknad.synlig
);

export const AvsluttSakSomBortfaltSelector = createSelector(
  ModalerSelector,
  modaler => modaler.avsluttSakSomBortfalt
);

export const ErAvsluttSakSomBortfaltSynligSelector = createSelector(
  AvsluttSakSomBortfaltSelector,
  avsluttSakSomBortfalt => avsluttSakSomBortfalt.synlig
);

export const HenleggSelector = createSelector(
  ModalerSelector,
  modaler => modaler.henlegg
);

export const ErHenleggSynligSelector = createSelector(
  HenleggSelector,
  henlegg => henlegg.synlig
);

export const OppfriskSelector = createSelector(
  ModalerSelector,
  modaler => modaler.oppfrisk
);

export const ErOppfriskSynligSelector = createSelector(
  OppfriskSelector,
  oppfrisk => oppfrisk.synlig
);

export const BehandlingUnderOppfriskningSelector = createSelector(
  OppfriskSelector,
  oppfrisk => oppfrisk.behandlingUnderOppfriskning
);

export const ValideringSelector = createSelector(
  ModalerSelector,
  modaler => modaler.validering
);

export const ErValideringSynligSelector = createSelector(
  ValideringSelector,
  validering => validering.synlig
);

export const RevurderFagsakSelector = createSelector(
  ModalerSelector,
  modaler => modaler.revurderFagsak
);

export const ErRevurderFagsakSynligSelector = createSelector(
  RevurderFagsakSelector,
  revurderFagsak => revurderFagsak.synlig
);
