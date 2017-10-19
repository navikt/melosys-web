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
import { hentSaksopplysninger } from '../ducks/saksopplysninger';

class Saksbehandling extends Component {
  static propTypes = {
    hentSaksopplysninger: PT.func.isRequired,
    match: PT.object.isRequired,
  }

  componentDidMount() {
    const { saksnr } = this.props.match.params;
    this.props.hentSaksopplysninger(saksnr);
  }

  render() {
    return (
      <div className="saksbehandling">
        <Container fluid>
          <Row>
            <Column xs="7">
              <Vilkarsvurdering />
              <Personopplysninger />
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


const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
  hentSaksopplysninger: saksnr => dispatch(hentSaksopplysninger(saksnr)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Saksbehandling));
