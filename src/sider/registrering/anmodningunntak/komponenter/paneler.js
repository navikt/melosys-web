import React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import PT from 'prop-types';

import * as KV from '../../../../kodeverk';

import Personopplysninger from '../../../../felleskomponenter/paneler/personopplysninger';
import ArbeidsgivereNorge from '../../../../felleskomponenter/paneler/arbeidsgivereNorge';

import { behandlingsgrunnlagSelectors } from '../../../../ducks/behandlingsgrunnlag';
import { formSelectors } from '../../../../ducks/form';

const Paneler = ({
  oppgittAdresseHarVerdier,
}) => (
  <form name="paneler">
    <Personopplysninger oppgittAdresseHarVerdier={oppgittAdresseHarVerdier} />
    <ArbeidsgivereNorge />
  </form>
);

Paneler.propTypes = {
  oppgittAdresseHarVerdier: PT.bool.isRequired,
};

const mapStateToProps = state => ({
  oppgittAdresseHarVerdier: formSelectors.RegistreringPanelerOppgittAdresseHarVerdierSelector(state),
  initialValues: {
    utenlandskIdent: behandlingsgrunnlagSelectors.PersonOpplysningerSelector(state).utenlandskIdent,
    oppgittAdresseGatenavn: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).gatenavn,
    oppgittAdresseHusnummer: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).husnummer,
    oppgittAdresseRegion: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).region,
    oppgittAdressePostnummer: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).postnummer,
    oppgittAdressePoststed: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).poststed,
    oppgittAdresseLand: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).landkode,
  },
});

const PanelerForm = reduxForm({
  form: KV.Form.REGISTRERING_PANELER,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
})(Paneler);

export default connect(mapStateToProps)(PanelerForm);
