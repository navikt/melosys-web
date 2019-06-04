import React, { Component, useState } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import uuid from 'uuid';
import Ikon from 'melosys-ikoner-assets';

import * as KV from '../kodeverk';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes';
import * as Ikoner from '../resources/images';

import { beregnAlder, formatterDatoTilNorsk } from '../utils/dato';

import PersonInfo from '../komponenter/personInfo';
import PanelHeader from '../komponenter/panelHeader/panelHeader';

import GeneriskAdresse from '../komponenter/adresser/generiskAdresse';
import StrukturertAdresse from '../komponenter/adresser/strukturertAdresse';
import UstrukturertAdresse from '../komponenter/adresser/ustrukturertAdresse';
import OppgittAdresseSoknad from './personopplysninger/oppgittAdresseSoknad';
import UtenlandskIdent from './personopplysninger/utenlandskIdent';

import './personopplysninger.css';
import { behandlingerSelectors } from '../ducks/behandlinger';
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

const AdresseRad = ({ periode: { fom, tom }, adresseKomponent }) => (
  <tr>
    <td>
      { adresseKomponent }
    </td>
    <td>
      { formatterDatoTilNorsk(fom) }
    </td>
    <td>
      { formatterDatoTilNorsk(tom) }
    </td>
  </tr>
);

AdresseRad.propTypes = {
  periode: MPT.Periode,
  adresseKomponent: PT.object.isRequired,
};

AdresseRad.defaultProps = {
  periode: {
    fom: '',
    tom: '',
  },
};

const AdresseHeader = ({ adresseTittel }) => (
  <thead>
    <tr>
      <th className="adresseTittel">{adresseTittel}</th>
      <th>Fra og med</th>
      <th>Til og med</th>
    </tr>
  </thead>
);

AdresseHeader.propTypes = {
  adresseTittel: PT.string.isRequired,
};

const ExpandableList = props => {
  const {
    render, defaultMax, altMax, btnTextExpanded, btnTextCollapsed, chevron, expandable,
  } = props;

  const [maxElements, setMaxElements] = useState(defaultMax);

  const toggleMaxElements = () => {
    if (maxElements === defaultMax) setMaxElements(altMax);
    else if (maxElements === altMax) setMaxElements(defaultMax);
  };

  const collapsed = maxElements === defaultMax;
  const chevronDirection = collapsed ? 'ned' : 'opp';
  const btnText = collapsed ? btnTextCollapsed : btnTextExpanded;

  return (
    <div className="expandableList">
      {render(maxElements)}
      <div className="btnContainer">
        {
          expandable &&
          <button onClick={toggleMaxElements}>
            {btnText}
            { chevron && <Nav.Chevron type={chevronDirection} />}
          </button>
        }
      </div>
    </div>
  );
};

ExpandableList.propTypes = {
  render: PT.func.isRequired,
  defaultMax: PT.number.isRequired,
  altMax: PT.number.isRequired,
  btnTextExpanded: PT.string.isRequired,
  btnTextCollapsed: PT.string.isRequired,
  chevron: PT.bool,
  expandable: PT.bool,
};

ExpandableList.defaultProps = {
  chevron: false,
  expandable: true,
};

class Personopplysninger extends Component {
  state = {
    visAnnenAdresseFelter: false,
  };

  settVisAnnenAdresseFelterTrue = () => this.setState({ visAnnenAdresseFelter: true });

  sjekkPerson = fnr => {
    const { alleRelevantePersoner } = this.props;
    const { hentPerson } = this.props;

    const eksistererPersonenLokalt = alleRelevantePersoner.some(person => person.fnr === fnr);

    if (!eksistererPersonenLokalt) {
      hentPerson(fnr);
    }
  };

  render() {
    const { redigerbart, person } = this.props;

    const { visAnnenAdresseFelter } = this.state;

    const { settVisAnnenAdresseFelterTrue } = this;

    const {
      fnr,
      kjoenn,
      sammensattNavn,
      foedselsdato,
      personhistorikk,
      personStatus,
      erEgenAnsatt,
    } = person;

    const { bostedsadressePerioder, postadressePerioder, midlertidigAdressePerioder } = personhistorikk;

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
              <Nav.Column xs="12">
                <ExpandableList
                  defaultMax={2}
                  altMax={100}
                  btnTextExpanded="Vis mindre"
                  btnTextCollapsed="Vis flere"
                  expandable={bostedsadressePerioder.length > 2}
                  chevron
                  render={maxElements => (
                    <table>
                      <AdresseHeader adresseTittel="Bostedsadresse (TPS)" />
                      <tbody>
                        {
                          bostedsadressePerioder.map(({ bostedsadresse, periode }, index) => (
                            index < maxElements ? <AdresseRad key={uuid()} adresseKomponent={<GeneriskAdresse adresse={bostedsadresse} />} periode={periode} /> : null
                          ))
                        }
                      </tbody>
                    </table>
                  )}
                />
                <ExpandableList
                  defaultMax={2}
                  altMax={100}
                  btnTextExpanded="Vis mindre"
                  btnTextCollapsed="Vis flere"
                  expandable={postadressePerioder.length > 2}
                  chevron
                  render={maxElements => (
                    <table>
                      <AdresseHeader adresseTittel="Postadresse (TPS)" />
                      <tbody>
                        {
                          postadressePerioder.map(({ postadresse, periode }, index) => (
                            index < maxElements ? <AdresseRad key={uuid()} adresseKomponent={<UstrukturertAdresse adresse={postadresse} />} periode={periode} /> : null
                          ))
                        }
                      </tbody>
                    </table>
                  )}
                />
                <ExpandableList
                  defaultMax={2}
                  altMax={100}
                  btnTextExpanded="Vis mindre"
                  btnTextCollapsed="Vis flere"
                  expandable={midlertidigAdressePerioder.length > 2}
                  chevron
                  render={maxElements => (
                    <table>
                      <AdresseHeader adresseTittel="Midlertidig postadresse" />
                      <tbody>
                        {
                          midlertidigAdressePerioder.map(({ midlertidigAdresse: { adressetype, strukturertAdresse, ustrukturertAdresse }, periode }, index) => {
                            if ((index >= maxElements)) return null;

                            let adresseKomponent = null;
                            if (adressetype === KV.Koder.AdresseType.STRUKTURERT) adresseKomponent = <StrukturertAdresse adresse={strukturertAdresse} />;
                            else if (adressetype === KV.Koder.AdresseType.USTRUKTURERT) adresseKomponent = <UstrukturertAdresse adresse={ustrukturertAdresse} />;

                            return <AdresseRad key={uuid()} adresseKomponent={adresseKomponent} periode={periode} />;
                          })
                        }
                      </tbody>
                    </table>
                  )}
                />
              </Nav.Column>
            </Nav.Row>
            {visAnnenAdresseFelter && <OppgittAdresseSoknad redigerbart={redigerbart} /> }
            {!visAnnenAdresseFelter && <Nav.Knapp className="knappMedIkon" disabled={!redigerbart} onClick={settVisAnnenAdresseFelterTrue}><Ikon kind="tilsette" />LEGG TIL ADRESSE</Nav.Knapp>}
            {/* SLUTT PERSONINFO */}
          </Nav.Container>
        </Nav.EkspanderbartpanelBase>
      </div>
    );
  }
}

Personopplysninger.propTypes = {
  redigerbart: PT.bool.isRequired,
  alleRelevantePersoner: PT.arrayOf(MPT.Person).isRequired,
  hentPerson: PT.func.isRequired,
  medfolgendeAndre: MPT.Person,
  person: MPT.Person.isRequired,
  personOpplysninger: PT.object.isRequired,
};

Personopplysninger.defaultProps = {
  medfolgendeAndre: {},
};

const mapStateToProps = state => ({
  alleRelevantePersoner: PersonSelectors.personerSelector(state),
  personOpplysninger: soknadSelectors.PersonOpplysningerSelector(state),
  person: behandlingerSelectors.PersonSelector(state),
  redigerbart: behandlingerSelectors.RedigerbartSelector(state),
  medfolgendeAndre: soknadSelectors.MedfolgendeAndreSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentPerson: fnr => dispatch(PersonOperations.hent(fnr)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Personopplysninger);
