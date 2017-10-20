import React from 'react';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes';
import moment from 'moment';

import './personopplysninger.css';

const uuid = require('uuid/v4');

function Personopplysninger(props) {
  if (Object.keys(props.person).length === 0) return (<div />);

  const {
    fnr,
    sivilstand,
    statsborgerskap,
    kjoenn,
    fornavn,
    etternavn,
    sammensattNavn,
    foedselsdato,
    bostedsadresse,
    mobiltelefon,
    epost,
    familerelasjon: { ektefelle, barn } } = props.person;

  // Påkrevde felter fra API
  const { poststed, postnr, land, gateadresse: { gatenavn, husnummer, husbokstav = '' } } = bostedsadresse;
  const aar = moment().diff(foedselsdato, 'years');


  return (
    <div className="personopplysninger panelSeksjon">
      <Nav.EkspanderbartPanel tittel={`${sammensattNavn} (${aar})`}>
        <Nav.Container fluid>
          {/* START PERSONINFO */}
          <Nav.Row className="person__seksjon">
            <Nav.Column xs="6">
              <dl className="person__detaljer">
                <dt>Fødselsnummer:</dt><dd>{fnr}</dd>
                <dt>Fornavn:</dt><dd>{fornavn}</dd>
                <dt>Etternavn:</dt><dd>{etternavn}</dd>
                <dt>Kjønn:</dt><dd>{kjoenn}</dd>
              </dl>
            </Nav.Column>
            <Nav.Column xs="6">
              <dl className="person__detaljer">
                <dt>Fødselsdato:</dt><dd>{foedselsdato}</dd>
                <dt>Statsborgerskap:</dt><dd>{statsborgerskap}</dd>
                <dt>Sivilstand:</dt><dd>{sivilstand}</dd>
              </dl>
            </Nav.Column>
          </Nav.Row>
          {/* SLUTT PERSONINFO */}
          {/* START ADRESSE */}
          <Nav.Row className="person__seksjon">
            <Nav.Column xs="6">
              <dl className="person__detaljer">
                <dt>Bostedsadresse</dt>
                <dd>{`${gatenavn} ${husnummer} ${husbokstav}`}</dd>
                <dd>{`${postnr} ${poststed}`}</dd>
                <dd>{`${land}`}</dd>
                <dt>Mobil:</dt><dd>{mobiltelefon}</dd>
                <dt>E-post:</dt><dd>{epost}</dd>
              </dl>
            </Nav.Column>
            <Nav.Column xs="6">
              <dl className="person__detaljer">
                <dt>Ektefelle:</dt><dd>{ektefelle.sammensattNavn} ({ektefelle.alder})</dd>
                <dt>Barn:</dt>
                { barn.map(item => <dd key={uuid()}>{item.sammensattNavn} ({item.alder})</dd>)}

              </dl>
            </Nav.Column>
          </Nav.Row>
          {/* SLUTT ADRESSE */}
        </Nav.Container>
      </Nav.EkspanderbartPanel>
    </div>
  );
}

Personopplysninger.propTypes = {
  person: MPT.Person.isRequired,
};

export default Personopplysninger;
