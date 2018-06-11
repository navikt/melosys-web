import React from 'react';
import moment from 'moment';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';

import EnkeltDato from '../felles-komponenter/datoOmrade/enkeltDato';
import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import './personopplysninger.css';

const ikonFraKjonn = kjoenn => {
  switch (kjoenn) {
    case 'K': { return Ikoner.Kvinne; }
    case 'M': { return Ikoner.Mann; }
    default: { return Ikoner.Ukjentkjoenn; }
  }
};
const visBostedsAdresse = bostedsadresse => {
  if (bostedsadresse) {
    const {
      poststed, postnr, land, gateadresse: { gatenavn, husnummer, husbokstav = '' },
    } = bostedsadresse;

    return (
      <div>
        <dd>{`${gatenavn} ${husnummer} ${husbokstav}`}</dd>
        <dd>{`${postnr} ${poststed}`}</dd>
        <dd>{`${land}`}</dd>
      </div>
    );
  }

  return null;
};

function Personopplysninger(props) {
  if (Object.keys(props.person).length === 0) return (<div />);

  const {
    fnr,
    sivilstand,
    statsborgerskap,
    kjoenn,
    sammensattNavn,
    foedselsdato,
    bostedsadresse,
  } = props.person;


  const aar = moment().diff(foedselsdato, 'years');

  return (
    <div className="personopplysninger panelSeksjon">
      <Nav.EkspanderbartpanelBase
        onClick={() => {}}
        heading={<PanelHeader ikon={ikonFraKjonn(kjoenn)} tittel={`${sammensattNavn} (${aar})`} undertittel={`Fødselsnummer: ${fnr}`} />}
        ariaTittel="Panel for personinformasjon" >
        <Nav.Container fluid>
          {/* START PERSONINFO */}
          <Nav.Row className="person__seksjon">
            <Nav.Column xs="6">
              <dl className="person__detaljer">
                <dt>Fødselsnummer:</dt><dd>{fnr}</dd>
                <dt>Kjønn:</dt><dd>{kjoenn}</dd>

                <dt>Bostedsadresse</dt>
                {visBostedsAdresse(bostedsadresse)}
              </dl>
            </Nav.Column>
            <Nav.Column xs="6">
              <dl className="person__detaljer">
                <dt>Fødselsdato:</dt><dd><EnkeltDato dato={foedselsdato} /></dd>
                <dt>Statsborgerskap:</dt><dd>{statsborgerskap}</dd>
                <dt>Sivilstand:</dt><dd>{sivilstand}</dd>
              </dl>
            </Nav.Column>
          </Nav.Row>
          {/* SLUTT PERSONINFO */}
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
}

Personopplysninger.propTypes = {
  person: MPT.Person.isRequired,
};

export default Personopplysninger;
