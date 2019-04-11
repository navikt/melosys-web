/* eslint no-alert:off, consistent-return:off */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';
import * as Nav from '../utils/navFrontend';
import Sticky from '../hjelpekomponenter/sticky';
import * as Skjema from '../soknad-komponenter/skjema/';
import { formSelectors } from '../ducks/form/';
import { solsidenOperations } from '../ducks/solsiden/';

import * as KV from '../kodeverk';
import './journalforing.css';

class Solsiden extends Component {
  overstyrSubmit = event => {
    event.preventDefault();
  };

  render() {
    return (
      <div className="journalforing">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="4">
              <h1>Solsiden</h1>
            </Nav.Column>
          </Nav.Row>
          <form onSubmit={this.overstyrSubmit}>
            <Nav.Row>
              <Nav.Column xs="4">
                <Sticky>
                  <Nav.Panel className="journalforing__skjema">
                    <Skjema.Select
                      feltNavn="landkode"
                      bredde="fullbredde"
                      label="Velg land:">
                      {
                        MKV.KTObjects.landkoder && MKV.KTObjects.landkoder
                          .map(elem => (<option key={elem.kode} value={elem.kode}>{elem.term}</option>))
                      }
                    </Skjema.Select>
                    <Skjema.Input feltNavn="tekstFelt" label="Tekst skrives her:" />
                    <Nav.Knapp className="knapp" onClick={() => this.props.sendInnData(this.props.solsidenSkjemaVerdier)}>Send Inn</Nav.Knapp>
                    <div className="journalforing__skjema__scroll">
                      <div className="journalforing__fotknapper" />
                    </div>
                  </Nav.Panel>
                </Sticky>
              </Nav.Column>
            </Nav.Row>
          </form>
        </Nav.Container>
      </div>
    );
  }
}

Solsiden.propTypes = {
  sendInnData: PT.func.isRequired,
  solsidenSkjemaVerdier: PT.object,
};

Solsiden.defaultProps = {
  solsidenSkjemaVerdier: {},
};

Solsiden.defaultProps = {
};

const mapStateToProps = state => ({
  solsidenSkjemaVerdier: formSelectors.SolsidenSelector(state).values,
  initialValues: {
    tekstFelt: 'Tekst...',
    landkode: MKV.Koder.landkoder.NO,
  },
});

const mapDispatchToProps = dispatch => ({
  sendInnData: data => dispatch(solsidenOperations.post(data)),
});

const SolsidenForm = reduxForm({
  form: KV.Form.SOLSIDEN,
})(Solsiden);


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SolsidenForm));
