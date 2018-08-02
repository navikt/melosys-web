import React from 'react';
import moment from 'moment';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes';
import * as Skjema from '../felles-komponenter/skjema';
import * as Ikoner from '../resources/images';

import EnkeltDato from '../felles-komponenter/datoOmrade/enkeltDato';
import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import Bostedsadresse from './adresser/bostedsadresse';
import Postadresse from './adresser/postadresse';
import Landvelger from './skjema/landvelger';

import './personopplysninger.css';

const ikonFraKjonn = kjoenn => {
  switch (kjoenn) {
    case 'K': { return Ikoner.Kvinne; }
    case 'M': { return Ikoner.Mann; }
    default: { return Ikoner.Ukjentkjoenn; }
  }
};

const UtenlandskIDLinje = ({ indeks }) => (
  <div className="utenlandskID__linje">
    <Skjema.Input bredde="S" feltNavn={`utenlandskID[${indeks}].ID`} label="Utenlandsk ID" />
    <Landvelger feltNavn={`utenlandskID[${indeks}].land`} label="Land" />
  </div>
);

UtenlandskIDLinje.propTypes = {
  indeks: PT.number.isRequired,
};

const UtenlandskIDWrapper = props => {
  const linjer = props.fields.getAll() || [];

  /* eslint react/no-array-index-key:off */
  return (
    <div className="utenlandskID__wrapper">
      { linjer.map((linje, indeks) => <UtenlandskIDLinje key={indeks} indeks={indeks} />) }
      <Nav.Knapp className="utenlandskID__leggtil" onClick={() => props.fields.push({ ID: '', land: [] })}>Legg til flere ID</Nav.Knapp>
    </div>
  );
};

UtenlandskIDWrapper.propTypes = {
  fields: PT.object.isRequired,
};

const UtenlandskID = props => (
  <div className="utenlandskID">
    <FieldArray name="utenlandskID" component={UtenlandskIDWrapper} props={props} />
  </div>
);

const PersonMerkelapper = ({ personStatus, erEgenAnsatt }) => {
  const erPersonDod = (personStatus.kode === 'DØD' || personStatus.kode === 'DØDD');

  return (
    <div className="personopplysninger__personstatus">
      { erPersonDod && <Nav.EtikettBase type="advarsel">DØD</Nav.EtikettBase> }
      { erEgenAnsatt && <Nav.EtikettBase type="advarsel">Egen ansatt</Nav.EtikettBase> }
    </div>
  );
};

PersonMerkelapper.propTypes = {
  personStatus: MPT.Kodeverk,
  erEgenAnsatt: PT.bool,
};

PersonMerkelapper.defaultProps = {
  personStatus: {},
  erEgenAnsatt: false,
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
    personStatus,
    erEgenAnsatt,
  } = props.person;

  const kjoennKode = kjoenn.kode || kjoenn;

  const alder = moment().diff(foedselsdato, 'years');

  return (
    <div className="personopplysninger panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={
          <div className="personopplysninger__panelheader">
            <PanelHeader ikon={ikonFraKjonn(kjoennKode)} tittel={`${sammensattNavn} (${alder})`} undertittel={`Fødselsnummer: ${fnr}`} />
            <PersonMerkelapper personStatus={personStatus} erEgenAnsatt={erEgenAnsatt} />
          </div>}
        ariaTittel="Panel for personinformasjon"
        apen
      >
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
              <UtenlandskID />
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
                <Skjema.Textarea feltNavn="oppgittAdresse" label="Adresse oppgitt av søker:" maxLength={200} />
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
