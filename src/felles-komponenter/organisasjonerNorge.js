import React from 'react';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes';

import './organisasjonerNorge.css';

const uuid = require('uuid/v4');

const EnkeltOrganisasjon = props => (
  <Nav.Row className="enkeltorganisasjon__seksjon">
    <Nav.Column xs="6">
      <dl className="enkeltorganisasjon__detaljer">
        <dt>Navn</dt>
        <dd>{props.organisasjon.navn}</dd>
        <dt>Org. nr / Id. nr</dt>
        <dd>{props.organisasjon.orgnummer}</dd>
        <dt>Besøksadresse</dt>
        <dd>{props.organisasjon.forretningsadresse.gateadresse.gatenavn}<br />{props.organisasjon.forretningsadresse.postnr} {props.organisasjon.forretningsadresse.poststed}<br /></dd>
      </dl>
    </Nav.Column>
    <Nav.Column xs="6">
      <dl className="enkeltorganisasjon__detaljer">
        <dt>Postadresse</dt>
        <dd>{props.organisasjon.postadresse}</dd>
        <dt>Kontaktperson</dt>
        <dd>{props.organisasjon.kontakt.navn}</dd>
        <dt>Telefon</dt>
        <dd>{props.organisasjon.kontakt.telefon}</dd>
        <dt>Epost</dt>
        <dd>{props.organisasjon.kontakt.epost}</dd>
      </dl>
    </Nav.Column>
  </Nav.Row>
);

EnkeltOrganisasjon.propTypes = {
  organisasjon: MPT.Organisasjon.isRequired,
};

function OrganisasjonerNorge ({ organisasjoner }) {
  /* const { orgnummer, navn, forretningsadresse: {gateadresse: {postnr, poststed, land}}, postadresse } = organisasjon; */
  return (
    <div className="organisasjonerNorge panelSeksjon">
      <Nav.EkspanderbartPanel tittel="Arbeidsgiver i Norge">
        <Nav.Container fluid>
          {organisasjoner.map(item => <EnkeltOrganisasjon key={uuid()} organisasjon={item} />)}
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
