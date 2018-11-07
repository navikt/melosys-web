import { createSelector } from 'reselect';

import { OrganisasjonSelectors } from '../organisasjoner';

/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

export const SoknadSelector = createSelector(
  state => state.soknad.data.soeknadDokument && state.soknad.data,
  soknad => soknad
);

export const ArbeidNorgeSelector = createSelector(
  state => (state.soknad.data.soeknadDokument ? state.soknad.data.soeknadDokument.arbeidNorge : {}),
  arbeidNorge => arbeidNorge || {}
);

export const ArbeidUtlandSelector = createSelector(
  state => (state.soknad.data.soeknadDokument ? state.soknad.data.soeknadDokument.arbeidUtland : []),
  arbeidUtland => arbeidUtland || []
);

export const ArbeidUtlandAdresseSelector = createSelector(
  state => (state.soknad.data.soeknadDokument ? state.soknad.data.soeknadDokument.arbeidUtland : {}),
  arbeidUtland => {
    const { adresse } = arbeidUtland;
    return adresse || {};
  }
);

export const ArbeidsinntektSelector = createSelector(
  state => (state.soknad.data.soeknadDokument ? state.soknad.data.soeknadDokument.arbeidsinntekt : {}),
  soknad => soknad || {}
);

export const ForetakUtlandSelector = createSelector(
  state => (state.soknad.data.soeknadDokument ? state.soknad.data.soeknadDokument.foretakUtland : []),
  foretakUtland => foretakUtland || []
);

export const JuridiskArbeidsgiverNorgeSelector = createSelector(
  state => state.soknad.data.soeknadDokument && state.soknad.data.soeknadDokument.juridiskArbeidsgiverNorge,
  soknad => soknad || {}
);

export const EkstraArbeidsgivereSelector = createSelector(
  state => JuridiskArbeidsgiverNorgeSelector(state),
  state => OrganisasjonSelectors.organisasjonerSelector(state),
  (juridiskArbeidsgiver, organisasjoner) => {
    const { ekstraArbeidsgivere } = juridiskArbeidsgiver;
    return organisasjoner.filter(organisasjon => ekstraArbeidsgivere.includes(organisasjon.orgnr));
  }
);

export const OppholdUtlandSelector = createSelector(
  state => (state.soknad.data.soeknadDokument ? state.soknad.data.soeknadDokument.oppholdUtland : {}),
  oppholdUtland => oppholdUtland || {}
);

export const OppholdsLandSelector = createSelector(
  state => OppholdUtlandSelector(state),
  oppholdUtland => oppholdUtland.oppholdslandKoder || []
);

export const OppholdUtlandPeriodeSelector = createSelector(
  state => OppholdUtlandSelector(state),
  oppholdUtland => {
    const { oppholdsPeriode } = oppholdUtland;
    return oppholdsPeriode || {};
  }
);

export const BostedSelector = createSelector(
  state => (state.soknad.data.soeknadDokument ? state.soknad.data.soeknadDokument.bosted : {}),
  bosted => bosted || {}
);

export const BostedAdresseSelector = createSelector(
  state => BostedSelector(state),
  bosted => {
    const { oppgittAdresse } = bosted;
    return oppgittAdresse || {};
  }
);

export const ArbeidsgiversBekreftelseSelector = createSelector(
  state => (state.soknad.data.soeknadDokument ? state.soknad.data.soeknadDokument.arbeidsgiversBekreftelse : {}),
  soknad => soknad || {}
);

export const MaritimtArbeidSelector = createSelector(
  state => (state.soknad.data.soeknadDokument ? state.soknad.data.soeknadDokument.maritimtArbeid : {}),
  maritimtArbeid => maritimtArbeid || {}
);

export const SelvstendigArbeidSelector = createSelector(
  state => (state.soknad.data.soeknadDokument ? state.soknad.data.soeknadDokument.selvstendigArbeid : {}),
  selvstendigArbeid => selvstendigArbeid || {}
);

export const PersonOpplysningerSelector = createSelector(
  state => (state.soknad.data.soeknadDokument ? state.soknad.data.soeknadDokument.personOpplysninger : {}),
  person => person || {}
);
