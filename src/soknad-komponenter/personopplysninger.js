import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as KV from '../kodeverk';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes';
import * as Ikoner from '../resources/images';

import { beregnAlder } from '../utils/dato';

import PersonInfo from '../komponenter/personInfo';
import PanelHeader from '../komponenter/panelHeader/panelHeader';

import BostedsAdresse from '../komponenter/adresser/bostedsAdresse';
import OppgittAdresseSoknad from './personopplysninger/oppgittAdresseSoknad';
import UtenlandskIdent from './personopplysninger/utenlandskIdent';

import './personopplysninger.css';
import { fagsakSelectors } from '../ducks/fagsaker';
import { PersonSelectors, PersonOperations } from '../ducks/personer';
import { soknadSelectors } from '../ducks/soknad';

const ikonFraKjonn = kjoenn => {
  switch (kjoenn) {
    case 'K': { return Ikoner.Kvinne; }
    case 'M': { return Ikoner.Mann; }
    default: { return Ikoner.Ukjentkjoenn; }
  }
};

const PersonMerkelapper = ({ personStatus, erEgenAnsatt }) => {
  const personStatusKode = KV.objektTilKode(personStatus);
  const erPersonDod = (personStatusKode === 'DOD' || personStatusKode === 'DØD' || personStatusKode === 'DØDD');

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

class Personopplysninger extends Component {
  sjekkPerson = fnr => {
    const { alleRelevantePersoner } = this.props;
    const { hentPerson } = this.props;

    const eksistererPersonenLokalt = alleRelevantePersoner.some(person => person.fnr === fnr);

    if (!eksistererPersonenLokalt) {
      hentPerson(fnr);
    }
  };

  render() {
    const { registrering = false, redigerbart, person } = this.props;

    const {
      fnr,
      kjoenn,
      sammensattNavn,
      foedselsdato,
      bostedsadresse,
      personStatus,
      erEgenAnsatt,
    } = person;

    if (Object.keys(person).length === 0) { return null; }

    return (
      <div className="personopplysninger panelSeksjon">
        <Nav.EkspanderbartpanelBase
          heading={
            <div className="personopplysninger__panelheader">
              <PanelHeader ikon={ikonFraKjonn(KV.objektTilKode(kjoenn))} tittel={`${sammensattNavn} (${beregnAlder(foedselsdato)})`} undertittel={`Fødselsnummer: ${fnr}`} />
              <PersonMerkelapper personStatus={personStatus} erEgenAnsatt={erEgenAnsatt} />
            </div>}
          ariaTittel="Panel for personinformasjon">
          <Nav.Container fluid>
            {/* START PERSONINFO */}
            <Nav.Row className="person__seksjon">
              <Nav.Column xs="6">
                <PersonInfo person={person} />
              </Nav.Column>
              <Nav.Column xs="6">
                <UtenlandskIdent disabled={!redigerbart} />
              </Nav.Column>
            </Nav.Row>
            <Nav.Row className="person__seksjon">
              <Nav.Column xs="4">
                <dl className="person__detaljer">
                  <dt>Bostedsadresse (TPS):</dt>
                  <BostedsAdresse bostedsadresse={bostedsadresse} />
                </dl>
              </Nav.Column>
            </Nav.Row>
            {!registrering &&
              <OppgittAdresseSoknad redigerbart={redigerbart} /> }
            {/* SLUTT PERSONINFO */}
          </Nav.Container>
        </Nav.EkspanderbartpanelBase>
      </div>
    );
  }
}

Personopplysninger.propTypes = {
  registrering: PT.bool,
  redigerbart: PT.bool.isRequired,
  alleRelevantePersoner: PT.arrayOf(MPT.Person).isRequired,
  hentPerson: PT.func.isRequired,
  medfolgendeAndre: MPT.Person,
  person: MPT.Person.isRequired,
  personOpplysninger: PT.object.isRequired,
};

Personopplysninger.defaultProps = {
  registrering: undefined,
  medfolgendeAndre: {},
};

const mapStateToProps = state => ({
  alleRelevantePersoner: PersonSelectors.personerSelector(state),
  personOpplysninger: soknadSelectors.PersonOpplysningerSelector(state),
  person: fagsakSelectors.PersonSelector(state),
  redigerbart: fagsakSelectors.RedigerbartSelector(state),
  medfolgendeAndre: soknadSelectors.MedfolgendeAndreSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentPerson: fnr => dispatch(PersonOperations.hent(fnr)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Personopplysninger);
