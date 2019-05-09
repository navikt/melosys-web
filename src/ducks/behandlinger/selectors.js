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
export const BehandlingIDtSelector = createSelector(
  state => (state.behandlinger.data ? state.behandlinger.data.behandlingID : -1),
  behandlingID => behandlingID
);
export const RedigerbartSelector = createSelector(
  state => (state.behandlinger.data ? state.behandlinger.data.redigerbart : false),
  redigerbart => redigerbart
);
export const OppsummeringSelector = createSelector(
  state => (state.behandlinger.data ? state.behandlinger.data.oppsummering : {}),
  oppsummering => oppsummering
);

export const SaksopplysningerSelector = createSelector(
  state => (state.behandlinger.data ? state.behandlinger.data.saksopplysninger : {}),
  saksopplysninger => saksopplysninger || {}
);
export const SakOgBehandlingSelector = createSelector(
  state => (state.behandlinger.data.saksopplysninger ? state.behandlinger.data.saksopplysninger.sakOgBehandling : {}),
  sakOgBehandling => sakOgBehandling || {}
);
export const PersonSelector = createSelector(
  state => (state.behandlinger.data && state.behandlinger.data.saksopplysninger ? state.behandlinger.data.saksopplysninger.person : {}),
  person => person
);

export const OrganisasjonerSelector = createSelector(
  state => (state.behandlinger.data && state.behandlinger.data.saksopplysninger ? state.behandlinger.data.saksopplysninger.organisasjoner : []),
  organisasjoner => organisasjoner
);

export const ArbeidsforholdSelector = createSelector(
  state => (state.behandlinger.data && state.behandlinger.data.saksopplysninger ? state.behandlinger.data.saksopplysninger.arbeidsforhold : []),
  arbeidsforhold => arbeidsforhold
);
