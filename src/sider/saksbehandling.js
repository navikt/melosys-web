import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Column } from 'nav-frontend-grid';
import './saksbehandling.css';
import Vilkarsvurdering from '../felles-komponenter/vilkarsvurdering/vilkarsvurdering';
import Personopplysninger from '../felles-komponenter/personopplysninger';
import Tilleggsopplysninger from '../felles-komponenter/tilleggsopplysninger';
import Medlemskap from '../felles-komponenter/medlemskap';
import SideOppsummering from '../felles-komponenter/sideOppsummering';
import SideDialog from '../felles-komponenter/sideDialog/sideDialog';
import SideKommentarer from '../felles-komponenter/sideKommentarer';

class Saksbehandling extends Component {
  componentDidMount() {

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

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Saksbehandling);
