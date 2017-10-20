import React from 'react';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes';

import './arbeidsgiverNorge.css';

function ArbeidsgiverNorge({ organisasjon }) {
  /* const { orgnummer, navn, forretningsadresse: {gateadresse: {postnr, poststed, land}}, postadresse } = organisasjon; */
  const { orgnummer } = organisasjon;
  return (
    <div className="arbeidsgiverNorge panelSeksjon">
      <Nav.EkspanderbartPanel tittel="Arbeidsgiver i Norge" apen>
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="6">
              <dl className="arbeidsgiver__detaljer">
                <dt>Org. nr / Id. nr</dt><dd>{orgnummer}</dd>
                <dt>Adresse</dt><dd>Adresseveien 123<br />Oslo</dd>
              </dl>
            </Nav.Column>
            <Nav.Column xs="6">
              <dl className="arbeidsgiver__detaljer">
                <dt>Kontaktperson</dt><dd>Ola Nordmann</dd>
                <dt>Telefon</dt><dd>12 34 56 78</dd>
              </dl>
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </Nav.EkspanderbartPanel>
    </div>
  );
}

ArbeidsgiverNorge.propTypes = {
  organisasjon: MPT.Organisasjon.isRequired,
};

export default ArbeidsgiverNorge;
