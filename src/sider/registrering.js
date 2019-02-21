/* eslint no-alert:off, consistent-return:off */
import React, { Component } from 'react';
import * as Nav from '../utils/navFrontend';
import Saksopplysninger from '../registrering-komponenter/saksopplysninger';

import './registrering.css';

class Registrering extends Component {
  render() {
    return (
      <div className="registrering">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="7">
              <Saksopplysninger />
            </Nav.Column>
            <Nav.Column xs="5">
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </div>
    );
  }
}
export default Registrering;
