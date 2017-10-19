import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Container, Row, Column } from 'nav-frontend-grid';
import PT from 'prop-types';
import './saksbehandling.css';
import Vilkarsvurdering from '../felles-komponenter/vilkarsvurdering/vilkarsvurdering';
import Personopplysninger from '../felles-komponenter/personopplysninger';
import Tilleggsopplysninger from '../felles-komponenter/tilleggsopplysninger';
import Medlemskap from '../felles-komponenter/medlemskap';
import OrganisasjonerNorge from '../felles-komponenter/arbeidsgiverNorge';
import SideOppsummering from '../felles-komponenter/sideOppsummering';
import SideDialog from '../felles-komponenter/sideDialog/sideDialog';
import SideKommentarer from '../felles-komponenter/sideKommentarer';
import { hentFagsaker, PersonSelector } from '../ducks/fagsaker';
import * as MPT from '../proptypes';

class Saksbehandling extends Component {
  static propTypes = {
    hentFagsaker: PT.func.isRequired,
    match: PT.object.isRequired,
    person: MPT.PersonPropType.isRequired,
  }

  componentDidMount() {
    const { saksnr } = this.props.match.params;
    this.props.hentFagsaker(saksnr);
  }

  render() {
    return (
      <div className="saksbehandling">
        <Container fluid>
          <Row>
            <Column xs="7">
              <Vilkarsvurdering />
              <Personopplysninger person={this.props.person} />
              <Tilleggsopplysninger />
              <OrganisasjonerNorge />
              <Medlemskap />
            </Column>
            <Column xs="5">
              <SideOppsummering />
              <SideDialog />
              <SideKommentarer />
            </Column>
          </Row>
        </Container>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  person: PersonSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentFagsaker: saksnr => dispatch(hentFagsaker(saksnr)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Saksbehandling));
