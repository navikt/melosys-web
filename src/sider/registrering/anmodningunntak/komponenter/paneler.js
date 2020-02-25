import React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import PT from 'prop-types';

import * as MPT from '../../../../proptypes';
import * as KV from '../../../../kodeverk';

import Medlemskap from '../../../../felleskomponenter/paneler/medlemskap';
import Personopplysninger from '../../../../felleskomponenter/paneler/personopplysninger';
import Kontantytelser from '../../../../felleskomponenter/paneler/kontantytelser';
import ArbeidsgivereNorge from '../../../../felleskomponenter/paneler/arbeidsgivereNorge';

import { behandlingsgrunnlagSelectors } from '../../../../ducks/behandlingsgrunnlag';
import { formSelectors } from '../../../../ducks/form';

const Paneler = ({
  medlemskap,
  oppgittAdresseHarVerdier,
}) => (
  <form name="paneler">
    <Personopplysninger oppgittAdresseHarVerdier={oppgittAdresseHarVerdier} />
    <ArbeidsgivereNorge />
    {medlemskap && <Medlemskap medlemskap={medlemskap} />}
    <Kontantytelser />
  </form>
);

Paneler.propTypes = {
  medlemskap: MPT.Medlemskap,
  oppgittAdresseHarVerdier: PT.bool.isRequired,
};

Paneler.defaultProps = {
  medlemskap: {},
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
