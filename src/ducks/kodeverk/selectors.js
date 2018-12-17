/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';


export const landkoderSelector = createSelector(
  state => state.kodeverk.data.landkoder,
  landkoder => landkoder || []
);

/* eslint-disable camelcase */
export const alleLovvalgSelector = createSelector(
  state => state.kodeverk.data.lovvalgsbestemmelser,
  lovvalgsbestemmelser => {
    const { forordning_883_2004 = [], forordning_987_2009 = [], tillegg = [] } = lovvalgsbestemmelser;
    return [...forordning_883_2004, ...forordning_987_2009, ...tillegg];
  }
);

export const oppgaveTyperSelector = createSelector(
  state => state.kodeverk.data.oppgavetyper,
  oppgavetyper => oppgavetyper || []
);

export const behandlingerSelector = createSelector(
  state => state.kodeverk.data.behandlinger || {},
  behandlinger => behandlinger
);

export const behandlingsStatusSelector = createSelector(
  state => behandlingerSelector(state),
  behandlinger => behandlinger.behandlingsstatus || []
);

export const behandlingsTyperSelector = createSelector(
  state => behandlingerSelector(state),
  behandlinger => behandlinger.behandlingstyper || []
);

export const sakstyperSelector = createSelector(
  state => state.kodeverk.data.sakstyper,
  sakstyper => sakstyper || []
);

export const dokumenttitlerSelector = createSelector(
  state => state.kodeverk.data.dokumenttitler,
  dokumenttitler => dokumenttitler || []
);

export const studieFinansieringSelector = createSelector(
  state => state.kodeverk.data.finansiering,
  studieFinansiering => studieFinansiering || []
);

export const begrunnelserSelector = createSelector(
  state => state.kodeverk.data.begrunnelser,
  begrunnelser => begrunnelser || {}
);

export const anmodningsBegrunnelserSelector = createSelector(
  state => begrunnelserSelector(state),
  begrunnelser => begrunnelser.artikkel16_1_anmodning || []
);

export const brevSelector = createSelector(
  state => state.kodeverk.data.brev,
  brev => brev || {}
);

export const produserbareDokumenterSelector = createSelector(
  state => brevSelector(state),
  brev => brev.produserbareDokumenter || []
);

export const aktoerrollerSelector = createSelector(
  state => state.kodeverk.data.aktoerroller,
  aktoerroller => aktoerroller || []
);

export const fartsomraderSelector = createSelector(
  state => state.kodeverk.data.fartsomrader,
  fartsomrader => fartsomrader || []
);
