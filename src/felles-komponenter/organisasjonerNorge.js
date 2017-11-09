import React from 'react';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';

import './organisasjonerNorge.css';

const uuid = require('uuid/v4');

const EnkeltOrganisasjon = ({ organisasjon }) => {
  const { orgnr, navn, forretningsadresse } = organisasjon;
  const { gateadresse, postnr, land } = forretningsadresse;
  const { gatenavn } = gateadresse;

  return (
    <Nav.Row className="enkeltorganisasjon__seksjon">
      <Nav.Column xs="6">
        <dl className="enkeltorganisasjon__detaljer">
          <dt>Navn</dt>
          <dd>{navn || '-'}</dd>
          <dt>Org. nr / Id. nr</dt>
          <dd>{orgnr || '-'}</dd>
          <dt>Besøksadresse</dt>
          <dd>{gatenavn}<br />{postnr} {land}<br /></dd>
        </dl>
      </Nav.Column>
    </Nav.Row>
  );
};

EnkeltOrganisasjon.propTypes = {
  organisasjon: MPT.Organisasjon.isRequired,
};

function OrganisasjonerNorge ({ organisasjoner }) {
  return (
    <div className="organisasjonerNorge panelSeksjon">
      <Nav.EkspanderbartPanel tittel="Arbeidsgiver i Norge">
        <Nav.Container fluid>
          {organisasjoner.map(organisasjon => <EnkeltOrganisasjon key={uuid()} organisasjon={organisasjon} />)}
        </Nav.Container>
      </Nav.EkspanderbartPanel>
    </div>
  );
}

OrganisasjonerNorge.propTypes = {
  organisasjoner: MPT.Organisasjoner,
};

OrganisasjonerNorge.defaultProps = {
  organisasjoner: [],
};

export default OrganisasjonerNorge;
