import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import * as Nav from '../utils/navFrontend';
import { ArbeidsgiverSelector } from '../ducks/saksopplysninger';
import * as MPT from '../proptypes';

import './arbeidsgiverNorge.css';

class ArbeidsgiverNorge extends Component {
  static propTypes = {
    organisasjoner: MPT.OrganisasjonerPropType,
  };

  static defaultProps = {
    organisasjoner: [],
  };

  render() {
    return (
      <div className="arbeidsgiverNorge panelSeksjon">
        <Nav.EkspanderbartPanel tittel="Arbeidsgiver i Norge" apen>
          <Nav.Container fluid>
            <Nav.Row>
              <Nav.Column xs="6">
                <dl className="arbeidsgiver__detaljer">
                  <dt>Org. nr / Id. nr</dt><dd>123456</dd>
                  <dt>Adresse</dt><dd>Adresseveien 123<br />Oslo</dd>
                </dl>
              </Nav.Column>
              <Nav.Column xs="6">
                <dl className="arbeidsgiver__detaljer">
                  <dt>Kontaktperson</dt><dd>Ola Nordmann</dd>
                  <dt>Telefon</dt><dd>12 34 56 78</dd>
                </dl>
              </Nav.Column>
            </Nav.Row>
          </Nav.Container>
        </Nav.EkspanderbartPanel>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  arbeidsgiver: ArbeidsgiverSelector(state),
});

const mapDispatchToProps = () => ({
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ArbeidsgiverNorge));
