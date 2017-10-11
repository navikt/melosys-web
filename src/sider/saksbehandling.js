import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Column } from 'nav-frontend-grid';
import { Knapp } from 'nav-frontend-knapper';
import { Undertittel } from 'nav-frontend-typografi';
import { Panel } from 'nav-frontend-paneler';
import './saksbehandling.css';

import Vilkarsvurdering from '../felles-komponenter/vilkarsvurdering/vilkarsvurdering';
import Personopplysninger from '../felles-komponenter/personopplysninger';
import Tilleggsopplysninger from '../felles-komponenter/tilleggsopplysninger';

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
            </Column>
            <Column xs="5">
              <Panel className="saksbehandling__soknadSammendrag">
                <Row>
                  <Column xs="12" md="6">
                    <Undertittel className="soknadSammendrag__header">Søknad om A1</Undertittel>
                  </Column>
                  <Column xs="12" md="6">
                    <Knapp>Behandlingsmeny</Knapp>
                  </Column>
                </Row>
              </Panel>
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
