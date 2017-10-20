import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import PT from 'prop-types';
import * as Nav from '../utils/navFrontend';
import './saksbehandling.css';
import Vilkarsvurdering from '../felles-komponenter/vilkarsvurdering/vilkarsvurdering';
import Personopplysninger from '../felles-komponenter/personopplysninger';
import Tilleggsopplysninger from '../felles-komponenter/tilleggsopplysninger';
import Medlemskap from '../felles-komponenter/medlemskap';
import OrganisasjonerNorge from '../felles-komponenter/arbeidsgiverNorge';
import SideOppsummering from '../felles-komponenter/sideOppsummering';
import SideDialog from '../felles-komponenter/sideDialog/sideDialog';
import SideKommentarer from '../felles-komponenter/sideKommentarer';
import {
  hentFagsaker,
  PersonSelector, OrganisasjonSelector, MedlemsskapSelector } from '../ducks/fagsaker';
import * as MPT from '../proptypes';

class Saksbehandling extends Component {
  static propTypes = {
    hentFagsaker: PT.func.isRequired,
    match: PT.object.isRequired,
    person: MPT.Person,
    organisasjon: MPT.Organisasjon,
    medlemsskap: MPT.Medlemskap,
  }
  static defaultProps = {
    person: {},
    organisasjon: {},
    medlemsskap: {},
  };

  componentDidMount() {
    const { fnr } = this.props.match.params;
    this.props.hentFagsaker(fnr);
  }

  render() {
    const { person, organisasjon, medlemsskap } = this.props;
    if (!person || !person.fnr) {
      return null;
    }
    return (
      <div className="saksbehandling">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="7">
              <Vilkarsvurdering />
              <Personopplysninger person={person} />
              <Tilleggsopplysninger />
              {organisasjon && <OrganisasjonerNorge organisasjon={organisasjon} />}
              {medlemsskap && <Medlemskap medlemsskap={medlemsskap} />}
            </Nav.Column>
            <Nav.Column xs="5">
              <SideOppsummering />
              <SideDialog />
              <SideKommentarer />
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const mockOrgnummer = 123456789;
  return {
    person: PersonSelector(state),
    organisasjon: OrganisasjonSelector(state, mockOrgnummer),
    medlemsskap: MedlemsskapSelector(state),
  };
};

const mapDispatchToProps = dispatch => ({
  hentFagsaker: fnr => dispatch(hentFagsaker(fnr)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Saksbehandling));
