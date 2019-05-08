/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';

/* eslint import/prefer-default-export:"off" */
export const BehandlingerSelector = createSelector(
  state => (state.behandlinger.data ? state.behandlinger.data : {}),
  behandling => behandling
);

export const SaksOpplysningerSelector = createSelector(
  state => BehandlingerSelector(state),
  saksopplysninger => saksopplysninger
);

export const PersonSelector = createSelector(
  state => SaksOpplysningerSelector(state),
  person => person
);

export const OrganisasjonerSelector = createSelector(
  state => SaksOpplysningerSelector(state),
  organisasjoner => organisasjoner || []
);
/*
export const OppsummeringSelector = createSelector(
  state => BehandlingerSelector(state),
  oppsummering => oppsummering || {}
);
*/

export const OppsummeringSelector = createSelector(
  state => BehandlingerSelector(state),
  oppsummering => ({
    behandlingstype: oppsummering.behandlingstype,
    behandlingsstatus: oppsummering.behandlingsstatus,
    registrertDato: oppsummering.registrertDato,
    sisteOpplysningerHentetDato: oppsummering.sisteOpplysningerHentetDato,
    endretDato: oppsummering.endretDato
  })
);

