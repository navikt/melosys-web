import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import uuid from 'uuid';
import Ikon from 'melosys-ikoner-assets';

import * as KV from '../../../kodeverk';
import * as Nav from '../../../utils/navFrontend';
import * as Mui from '../../../felleskomponenter/ui';
import * as MPT from '../../../proptypes';
import * as Ikoner from '../../../resources/images';

import { formatterDatoTilNorsk } from '../../../utils/dato';

import PersonInfo from '../../personInfo';
import PanelHeader from '../../panelHeader/panelHeader';

import GeneriskAdresse from '../../adresser/generiskAdresse';
import StrukturertAdresse from '../../adresser/strukturertAdresse';
import UstrukturertAdresse from '../../adresser/ustrukturertAdresse';
import OppgittAdresseSoknad from './oppgittAdresseSoknad';
import UtenlandskIdent from './utenlandskIdent';
import ExpandableTable from './expandableTable';
import Medlemskap from './medlemskap';
import Kontantytelser from './kontantytelser';

import { behandlingerSelectors } from '../../../ducks/behandlinger';
import { redigerbartSelectors } from '../../../ducks/redigerbart';

import './personopplysninger.css';

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
  <tr className="adresseRad">
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
  <thead className="adresseHeader">
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

export class Personopplysninger extends Component {
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
      medlemskap,
    } = this.props;

    const { visAnnenAdresseFelterKnappKlikket } = this.state;

    const { settVisAnnenAdresseFelterKnappKlikketTrue } = this;

    const {
      sammensattNavn,
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
              <PanelHeader tittel={KV.Panel.informasjonOmBruker.tittel} />
              <PersonMerkelapper personStatus={personStatus} erEgenAnsatt={erEgenAnsatt} />
            </div>}
          ariaTittel="Panel for personinformasjon">
          <Nav.Container fluid>
            <Nav.Row>
              <Nav.Column xs="12">
                <Mui.Undertittel ikon={Ikoner.AccountCircle} tekst={sammensattNavn} className="undertittel" />
              </Nav.Column>
            </Nav.Row>
            <Nav.Row>
              <Nav.Column xs="6">
                <PersonInfo person={person} />
              </Nav.Column>
              <Nav.Column xs="6">
                <UtenlandskIdent disabled={!redigerbart} />
              </Nav.Column>
            </Nav.Row>
            <Nav.Row className="registrerteAdresser">
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
              <OppgittAdresseSoknad
                redigerbart={redigerbart}
                tittel={KV.Panel.informasjonOmBruker.undertitler.annenOppgittAdresse}
              />
            }
            {
              !visAnnenAdresseFelter &&
              <Mui.Knapp className="knappMedIkon" disabled={!redigerbart} onClick={settVisAnnenAdresseFelterKnappKlikketTrue}><Ikon kind="tilsette" />LEGG TIL ADRESSE</Mui.Knapp>
            }
            <Nav.Row>
              <Nav.Column xs="12">
                <Mui.Undertittel ikon={Ikoner.Medlemskap} tekst={KV.Panel.informasjonOmBruker.undertitler.medlemskap} className="undertittel" />
              </Nav.Column>
            </Nav.Row>
            <Nav.Row>
              <Nav.Column xs="12">
                <Medlemskap medlemskap={medlemskap} />
              </Nav.Column>
            </Nav.Row>
            <Nav.Row>
              <Nav.Column xs="12">
                <Mui.Undertittel ikon={Ikoner.Inntekt} tekst={KV.Panel.informasjonOmBruker.undertitler.kontantytelser} className="undertittel" />
              </Nav.Column>
            </Nav.Row>
            <Nav.Row>
              <Nav.Column xs="12">
                <Kontantytelser />
              </Nav.Column>
            </Nav.Row>
          </Nav.Container>
        </Nav.EkspanderbartpanelBase>
      </div>
    );
  }
}

Personopplysninger.propTypes = {
  redigerbart: PT.bool.isRequired,
  person: MPT.Behandlinger.Saksopplysninger.Person.isRequired,
  personhistorikk: MPT.Personhistorikk.isRequired,
  oppgittAdresseHarVerdier: PT.bool.isRequired,
  medlemskap: MPT.Medlemskap,
};

Personopplysninger.defaultProps = {
  medlemskap: {},
};

const mapStateToProps = state => ({
  person: behandlingerSelectors.PersonSelector(state),
  personhistorikk: behandlingerSelectors.PersonhistorikkSelector(state),
  redigerbart: redigerbartSelectors.PanelerRedigerbartSelector(state),
  medlemskap: behandlingerSelectors.MedlemskapSelector(state),
});

export default connect(mapStateToProps)(Personopplysninger);
