import React from 'react';
import moment from 'moment';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes';
import * as Skjema from '../felles-komponenter/skjema';
import * as Ikoner from '../resources/images';

import EnkeltDato from '../felles-komponenter/datoOmrade/enkeltDato';
import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import Bostedsadresse from './adresser/bostedsadresse';
import Postadresse from './adresser/postadresse';

import './personopplysninger.css';

const ikonFraKjonn = kjoenn => {
  switch (kjoenn) {
    case 'K': { return Ikoner.Kvinne; }
    case 'M': { return Ikoner.Mann; }
    default: { return Ikoner.Ukjentkjoenn; }
  }
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
    postadresse,
    postadresseMidlertidig,
  } = props.person;

  const kjoennKode = kjoenn.kode || kjoenn;


  const aar = moment().diff(foedselsdato, 'years');

  return (
    <div className="personopplysninger panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={ikonFraKjonn(kjoennKode)} tittel={`${sammensattNavn} (${aar})`} undertittel={`Fødselsnummer: ${fnr}`} />}
        ariaTittel="Panel for personinformasjon"
        apen >
        <Nav.Container fluid>
          {/* START PERSONINFO */}
          <Nav.Row className="person__seksjon">
            <Nav.Column xs="6">
              <dl className="person__detaljer">
                <dt>Fødselsnummer:</dt><dd>{fnr}</dd>
                <dt>Statsborgerskap:</dt><dd>{statsborgerskap.term || statsborgerskap}</dd>
                <dt>Fødselsdato:</dt><dd><EnkeltDato dato={foedselsdato} /></dd>
                <dt>Kjønn:</dt><dd>{kjoenn.term || kjoenn}</dd>
                <dt>Sivilstand:</dt><dd>{sivilstand}</dd>
              </dl>
            </Nav.Column>
            <Nav.Column xs="6">
              Utenlandsk ID
            </Nav.Column>
          </Nav.Row>
          <Nav.Row className="person__seksjon">
            <Nav.Column xs="4">
              <dl className="person__detaljer">
                <dt>Bostedsadresse (TPS):</dt>
                <Bostedsadresse bostedsadresse={bostedsadresse} />
              </dl>
            </Nav.Column>
            <Nav.Column xs="4">
              <dl className="person__detaljer">
                <dt>Postadresse (TPS):</dt>
                <Postadresse postadresse={postadresse} />
              </dl>
            </Nav.Column>
            <Nav.Column xs="4">
              <dl className="person__detaljer">
                <dt>Midl. postadresse (TPS):</dt>
                <Postadresse postadresse={postadresseMidlertidig} />
              </dl>
            </Nav.Column>
          </Nav.Row>
          <Nav.Row className="person__seksjon">
            <Nav.Column xs="6">
              <dl className="person__detaljer">
                <Skjema.Textarea feltNavn="oppgittAdresse" label="Adresse oppgitt av søker:" />
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
