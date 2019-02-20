import React from 'react';
import PT from 'prop-types';
import { Link } from 'react-router-dom';

import * as Nav from '../../../utils/navFrontend';
import { kodeverkObjektTilTerm } from '../../../utils/kodeverk';
import EnkeltDato from '../../../komponenter/datoOmrade/enkeltDato';

import './behandling.css';

const Behandling = ({ behandling, link }) => {
  const { behandlingstype, behandlingsstatus, registrertDato } = behandling;

  return (
    <Link to={link} className="behandling__link">
      <Nav.Panel className="behandling">
        <Nav.Row>
          <Nav.Column>
            <Nav.Column xs="12" md="5">
              <dl className="behandling__meta">
                <dt>Behandlingstype:</dt>
                <dd>{kodeverkObjektTilTerm(behandlingstype) || '(ukjent)'}</dd>
                <dt>Opprettelsesdato:</dt>
                <dd>{<EnkeltDato dato={registrertDato} /> || '(ukjent)'}</dd>
              </dl>
            </Nav.Column>
            <Nav.Column xs="12" md="4">
              <dl className="behandling__meta">
                <dt>Behandlingsstatus:</dt>
                <dd>{kodeverkObjektTilTerm(behandlingsstatus) || '(ukjent)'}</dd>
              </dl>
            </Nav.Column>
          </Nav.Column>
          <Nav.Column xs="12" md="3">
            <Nav.Knapp>VIS BEHANDLING</Nav.Knapp>
          </Nav.Column>
        </Nav.Row>
      </Nav.Panel>
    </Link>
  );
};

Behandling.propTypes = {
  behandling: PT.object.isRequired,
  link: PT.string.isRequired,
};

export default Behandling;
