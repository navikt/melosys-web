import React from 'react';
import moment from 'moment';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes';
import * as Skjema from '../felles-komponenter/skjema';
import * as Ikoner from '../resources/images';

import EnkeltDato from '../felles-komponenter/datoOmrade/enkeltDato';
import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import Bostedsadresse from './adresser/bostedsadresse';
import Postadresse from './adresser/postadresse';

import UtenlandskID from './personopplysninger/utenlandskID';
import MedfolgendeBarn from './personopplysninger/medfolgendeBarn';

import './personopplysninger.css';

const ikonFraKjonn = kjoenn => {
  switch (kjoenn) {
    case 'K': { return Ikoner.Kvinne; }
    case 'M': { return Ikoner.Mann; }
    default: { return Ikoner.Ukjentkjoenn; }
  }
};

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
    barn,
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
          <Nav.Row className="person__seksjon">
            <Nav.Column xs="12">
              <MedfolgendeBarn barnAlle={barn} />
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
