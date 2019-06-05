import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector, autofill, setSubmitFailed } from 'redux-form';
import PT from 'prop-types';

import * as KV from '../kodeverk';
import * as Utils from '../utils';
import * as Api from '../services/api';
import * as MPT from '../proptypes';

import * as Nav from '../utils/navFrontend';
import Personopplysninger from '../soknad-komponenter/personopplysninger';
import Medlemskap from '../komponenter/medlemskap';
import Landvelger from '../soknad-komponenter/skjema/landvelger';
import { formSelectors } from '../ducks/form';

class Saksopplysninger extends Component {
  overstyrSubmit = event => {
    event.preventDefault();
  };
  submitRegistrering = () => {
    const { behandlingID } = this.props;
    /* eslint-disable no-console */
    Api.Registrering.unntaksperioder(behandlingID, {})
      .then(() => {
        console.log('[POST] successful');
      })
      .catch(err => console.error(err));
    /* eslint-enable no-console */
    return true;
  };
  render() {
    const { medlemskap, sed } = this.props;
    if (!sed.lovvalgsperiode) {
      return null;
    }
    console.log(sed);
    const { lovvalgsperiode, lovvalgBestemmelse } = sed;
    const fom = Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.fom);
    const tom = Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.tom);
    const inputStyle = {
      width: '110%',
    };
    return (
      <div>
        <form name="registrering" id="registrering" onSubmit={this.overstyrSubmit} >
          <div className="stegvelger panelSeksjon">
            <div className="panel stegFane steg0 stegFane--aktiv">
              <Nav.Systemtittel>Redigering av unntaksperioder</Nav.Systemtittel>
              <br />
              <div className="vurderingEndrePeriode">
                <Nav.Undertittel>Lovvalgsperiode fra SED</Nav.Undertittel>
                <Nav.Row>
                  <Nav.Column xs="3">
                    {/* <Skjema.Input datoFelt label="Startdato" feltNavn="startdato" /> */}
                    <Nav.Input
                      bredde="XXL"
                      label="Startdato"
                      value={fom}
                      readOnly
                    />
                  </Nav.Column>
                  <Nav.Column xs="3">
                    {/* <Skjema.Input datoFelt label="Sluttdato" feltNavn="sluttdato" /> */}
                    <Nav.Input
                      style={inputStyle}
                      bredde="XXL"
                      label="Sluttdato"
                      value={tom}
                      readOnly
                    />
                  </Nav.Column>
                </Nav.Row>
                <Nav.Row>
                  <Nav.Column xs="3">
                    <Landvelger label="Land" feltNavn="landkode" disabled={true}/>
                  </Nav.Column>
                  <Nav.Column xs="3">
                    {/* <Skjema.Input label="Hjemmel" feltNavn="hjemmel" /> */}
                    <Nav.Input
                      style={inputStyle}
                      bredde="XXL"
                      label="Hjemmel"
                      value={lovvalgBestemmelse}
                      readOnly
                    />
                  </Nav.Column>
                </Nav.Row>
                <Nav.Row>
                  <Nav.Column xs="3">
                    <h3>Treff ved registerkontroll</h3>
                  </Nav.Column>
                </Nav.Row>
                <Nav.Row>
                  <Nav.Column xs="3">
                    <Nav.Knapp onClick={() => this.submitRegistrering()}>GODKJENN</Nav.Knapp>
                  </Nav.Column>
                </Nav.Row>
              </div>
            </div>
          </div>
        </form>
        <Personopplysninger redigerbart registrering />
        {medlemskap && <Medlemskap medlemskap={medlemskap} />}
      </div>
    );
  }
}

Saksopplysninger.propTypes = {
  behandlingID: PT.number.isRequired,
  medlemskap: MPT.Medlemskap,
  sed: PT.object, // TODO prop-type
  skjema: PT.any,
  landkode: PT.string,
  hjemmel: PT.string,
  registreringSkjemaVerdier: PT.object,
  settFeilFelt: PT.func.isRequired,
  match: PT.object.isRequired,
  location: PT.object.isRequired,
};

Saksopplysninger.defaultProps = {
  medlemskap: {},
  sed: {},
  skjema: {},
  landkode: '',
  hjemmel: '',
  registreringSkjemaVerdier: {},
};

const skjemaSelector = formValueSelector(KV.Form.REGISTRERING);
const mapStateToProps = state => ({
  registreringSkjemaVerdier: formSelectors.RegistreringFormSelector(state).values,
  landkode: skjemaSelector(state, 'landkode'),
  hjemmel: skjemaSelector(state, 'hjemmel'),
  initialValues: {
    landkode: 'NO',
    hjemmel: 'Hva er hjemmel?',
  },
});
const mapDispatchToProps = dispatch => ({
  settFeltInnhold: (feltNavn, verdi) => dispatch(autofill(KV.Form.REGISTRERING, feltNavn, verdi)),
  settFeilFelt: (...feltNavn) => (setSubmitFailed(KV.Form.REGISTRERING, ...feltNavn)),
});

const validering = values => {
  const landkode = !values.landkode ? 'Du må velge land.' : null;
  return {
    landkode,
  };
};

const SaksopplysningerForm = reduxForm({
  form: KV.Form.REGISTRERING,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: validering,
  onSubmit: () => {},
})(Saksopplysninger);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SaksopplysningerForm));
