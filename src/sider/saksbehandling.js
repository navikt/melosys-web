import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Container, Row, Column } from 'nav-frontend-grid';
import { Knapp } from 'nav-frontend-knapper';
import { Undertittel } from 'nav-frontend-typografi';
import { Panel } from 'nav-frontend-paneler';
import './saksbehandling.css';

import Vilkarsvurdering from '../felles-komponenter/vilkarsvurdering/vilkarsvurdering';

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

export default withRouter(Saksbehandling);
