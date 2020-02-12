import React, { Component, useState } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import uuid from 'uuid';
import Ikon from 'melosys-ikoner-assets';

import * as KV from '../../../kodeverk';
import * as Nav from '../../../utils/navFrontend';
import * as Mui from '../../../felleskomponenter/ui';
import * as MPT from '../../../proptypes';
import * as Ikoner from '../../../resources/images';

import { beregnAlder, formatterDatoTilNorsk } from '../../../utils/dato';

import PersonInfo from '../../personInfo';
import PanelHeader from '../../panelHeader/panelHeader';

import GeneriskAdresse from '../../adresser/generiskAdresse';
import StrukturertAdresse from '../../adresser/strukturertAdresse';
import UstrukturertAdresse from '../../adresser/ustrukturertAdresse';
import OppgittAdresseSoknad from './oppgittAdresseSoknad';
import UtenlandskIdent from './utenlandskIdent';

import './personopplysninger.css';
import { behandlingerSelectors } from '../../../ducks/behandlinger';
import { soknadSelectors } from '../../../ducks/soknad';
import { redigerbartSelectors } from '../../../ducks/redigerbart';

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

export const AdresseRad = ({ periode: { fom, tom }, adresseKomponent }) => (
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

export const AdresseHeader = ({ adresseTittel }) => (
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

export const ExpandableTable = props => {
  const {
    renderElement, elements, header, amountOfItemsCollapsed, btnTextExpanded, btnTextCollapsed, chevron, expandable,
  } = props;

  const [collapsed, setCollapsed] = useState(true);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const chevronDirection = collapsed ? 'ned' : 'opp';
  const btnText = collapsed ? btnTextCollapsed : btnTextExpanded;

  const renderableElements = collapsed ? elements.slice(0, amountOfItemsCollapsed) : elements;

  return (
    <div className="expandableList">
      <table>
        {header}
        <tbody>
          {
            renderableElements.map(renderElement)
          }
        </tbody>
      </table>
      <div className="btnContainer">
        {
          expandable &&
          <button type="button" onClick={toggleCollapsed}>
            {btnText}
            { chevron && <Nav.Chevron type={chevronDirection} />}
          </button>
        }
      </div>
    </div>
  );
};

ExpandableTable.propTypes = {
  renderElement: PT.func.isRequired,
  header: PT.node.isRequired,
  elements: PT.array.isRequired,
  amountOfItemsCollapsed: PT.number.isRequired,
  btnTextExpanded: PT.string.isRequired,
  btnTextCollapsed: PT.string.isRequired,
  chevron: PT.bool,
  expandable: PT.bool,
};

ExpandableTable.defaultProps = {
  chevron: false,
  expandable: true,
};

class Personopplysninger extends Component {
  state = {
    visAnnenAdresseFelterKnappKlikket: false,
  };

  settVisAnnenAdresseFelterKnappKlikketTrue = () => this.setState({ visAnnenAdresseFelterKnappKlikket: true });

  render() {
    const {
      redigerbart,
      person,
      personhistorikk,
      oppgittAdresseHarVerdier,
    } = this.props;

    const { visAnnenAdresseFelterKnappKlikket } = this.state;

    const { settVisAnnenAdresseFelterKnappKlikketTrue } = this;

    const {
      fnr,
      kjoenn,
      sammensattNavn,
      foedselsdato,
      personStatus,
      erEgenAnsatt,
    } = person;

    const { bostedsadressePerioder, postadressePerioder, midlertidigAdressePerioder } = personhistorikk;

    if (Object.keys(person).length === 0) { return null; }

    const visAnnenAdresseFelter = visAnnenAdresseFelterKnappKlikket || oppgittAdresseHarVerdier;

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
                <ExpandableTable
                  amountOfItemsCollapsed={1}
                  btnTextExpanded="Vis mindre"
                  btnTextCollapsed="Vis flere"
                  expandable={bostedsadressePerioder.length > 1}
                  chevron
                  header={<AdresseHeader adresseTittel="Bostedsadresse (TPS)" />}
                  elements={bostedsadressePerioder}
                  renderElement={element => (
                    <AdresseRad key={uuid()} adresseKomponent={<GeneriskAdresse adresse={element.bostedsadresse} />} periode={element.periode} />
                  )}
                />
                <ExpandableTable
                  amountOfItemsCollapsed={1}
                  btnTextExpanded="Vis mindre"
                  btnTextCollapsed="Vis flere"
                  expandable={postadressePerioder.length > 1}
                  chevron
                  header={<AdresseHeader adresseTittel="Postadresse (TPS)" />}
                  elements={postadressePerioder}
                  renderElement={element => (
                    <AdresseRad key={uuid()} adresseKomponent={<UstrukturertAdresse adresse={element.postadresse} />} periode={element.periode} />
                  )}
                />
                <ExpandableTable
                  amountOfItemsCollapsed={1}
                  btnTextExpanded="Vis mindre"
                  btnTextCollapsed="Vis flere"
                  expandable={midlertidigAdressePerioder.length > 1}
                  chevron
                  header={<AdresseHeader adresseTittel="Midlertidig postadresse" />}
                  elements={midlertidigAdressePerioder}
                  renderElement={element => {
                    const {
                      midlertidigAdresse: { adressetype, strukturertAdresse, ustrukturertAdresse }, periode,
                    } = element;
                    let adresseKomponent = null;

                    if (adressetype === KV.Koder.AdresseType.STRUKTURERT) adresseKomponent = <StrukturertAdresse adresse={strukturertAdresse} />;
                    else if (adressetype === KV.Koder.AdresseType.USTRUKTURERT) adresseKomponent = <UstrukturertAdresse adresse={ustrukturertAdresse} />;

                    return <AdresseRad key={uuid()} adresseKomponent={adresseKomponent} periode={periode} />;
                  }}
                />
              </Nav.Column>
            </Nav.Row>
            {
              visAnnenAdresseFelter &&
              <OppgittAdresseSoknad redigerbart={redigerbart} />
            }
            {
              !visAnnenAdresseFelter &&
              <Mui.Knapp className="knappMedIkon" disabled={!redigerbart} onClick={settVisAnnenAdresseFelterKnappKlikketTrue}><Ikon kind="tilsette" />LEGG TIL ADRESSE</Mui.Knapp>
            }
          </Nav.Container>
        </Nav.EkspanderbartpanelBase>
      </div>
    );
  }
}

Personopplysninger.propTypes = {
  registrering: PT.bool,
  redigerbart: PT.bool.isRequired,
  medfolgendeAndre: MPT.Behandlinger.Saksopplysninger.Person,
  person: MPT.Behandlinger.Saksopplysninger.Person.isRequired,
  personhistorikk: MPT.Personhistorikk.isRequired,
  personOpplysninger: PT.object.isRequired,
  oppgittAdresseHarVerdier: PT.bool.isRequired,
};

Personopplysninger.defaultProps = {
  registrering: undefined,
  medfolgendeAndre: {},
};

const mapStateToProps = state => ({
  personOpplysninger: soknadSelectors.PersonOpplysningerSelector(state),
  person: behandlingerSelectors.PersonSelector(state),
  personhistorikk: behandlingerSelectors.PersonhistorikkSelector(state),
  redigerbart: redigerbartSelectors.PanelerRedigerbartSelector(state),
  medfolgendeAndre: soknadSelectors.MedfolgendeAndreSelector(state),
});

export default connect(mapStateToProps)(Personopplysninger);
