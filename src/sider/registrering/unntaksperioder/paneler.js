import React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import * as MPT from '../../../proptypes';
import * as KV from '../../../kodeverk';

import Medlemskap from '../../../felleskomponenter/paneler/medlemskap';
import Personopplysninger from '../../../felleskomponenter/paneler/personopplysninger';
import Kontantytelser from '../../../felleskomponenter/paneler/kontantytelser';

import { soknadSelectors } from '../../../ducks/soknad';

const Paneler = ({
  medlemskap,
}) => (
  <form name="paneler">
    <Personopplysninger />
    {medlemskap && <Medlemskap medlemskap={medlemskap} />}
    <Kontantytelser />
  </form>
);

Paneler.propTypes = {
  medlemskap: MPT.Medlemskap,
};

Paneler.defaultProps = {
  medlemskap: {},
};

const mapStateToProps = state => ({
  initialValues: {
    utenlandskIdent: soknadSelectors.PersonOpplysningerSelector(state).utenlandskIdent,
    oppgittAdresseGatenavn: soknadSelectors.BostedAdresseSelector(state).gatenavn,
    oppgittAdresseHusnummer: soknadSelectors.BostedAdresseSelector(state).husnummer,
    oppgittAdresseRegion: soknadSelectors.BostedAdresseSelector(state).region,
    oppgittAdressePostnummer: soknadSelectors.BostedAdresseSelector(state).postnummer,
    oppgittAdressePoststed: soknadSelectors.BostedAdresseSelector(state).poststed,
    oppgittAdresseLand: soknadSelectors.BostedAdresseSelector(state).landkode,
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
