import React, { ReactNode } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from 'AppTypes';
import { PersonHistorikk, Periode } from 'Domene';

import * as KV from '../../../../kodeverk';
import * as Nav from '../../../../utils/navFrontend';
import * as Utils from '../../../../utils';
import * as Etiketter from '../etiketter';

import PersonInfo from './personinfo';

import GeneriskAdresse from '../../../adresser/generiskAdresse';
import StrukturertAdresse from '../../../adresser/strukturertAdresse';
import UstrukturertAdresse from '../../../adresser/ustrukturertAdresse';
import EnkeltDato from '../../../datoOmrade/enkeltDato';
import AnnenAdresse from './annenadresse';
import UtenlandskIdent from './utenlandskident';
import ExpandableList from '../../../expandablelist';

import { behandlingerSelectors } from '../../../../ducks/behandlinger';
import { redigerbartSelectors } from '../../../../ducks/redigerbart';

import './person.css';

interface AdresseRadProps {
  periode: Periode,
  adresseNode: ReactNode,
}

export const AdresseRad = ({ periode: { fom, tom }, adresseNode }: AdresseRadProps) => (
  <Nav.Row className="adresse__rad">
    <Nav.Column xs="3">
      { adresseNode }
    </Nav.Column>
    <Nav.Column xs="3">
      <EnkeltDato dato={fom} />
    </Nav.Column>
    <Nav.Column xs="3">
      <EnkeltDato dato={tom} />
    </Nav.Column>
  </Nav.Row>
);

interface AdresseHeaderProps {
  adresseTittel: string,
}

export const AdresseHeader = ({ adresseTittel }: AdresseHeaderProps) => (
  <Nav.Row>
    <Nav.Column xs="3">{adresseTittel}</Nav.Column>
    <Nav.Column xs="3">Fra og med</Nav.Column>
    <Nav.Column xs="3">Til og med</Nav.Column>
  </Nav.Row>
);

const mapStateToProps = (state: RootState) => ({
  person: behandlingerSelectors.PersonSelector(state),
  personhistorikk: behandlingerSelectors.PersonhistorikkSelector(state),
  redigerbart: redigerbartSelectors.PanelerRedigerbartSelector(state),
});
const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export const Person = ({
  redigerbart,
  person,
  personhistorikk,
}: PropsFromRedux) => {
  const { bostedsadressePerioder, postadressePerioder, midlertidigAdressePerioder } = personhistorikk as PersonHistorikk;

  if (Object.keys(person).length === 0) { return null; }

  return (
    <div className="person">
      <Nav.Row>
        <Nav.Column xs="12" className="etikett__container">
          <Etiketter.FraRegister />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          <PersonInfo person={person} />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row className="registrerteAdresser">
        <Nav.Column xs="12">
          <ExpandableList
            header={<AdresseHeader adresseTittel="Bostedsadresse" />}
            elements={bostedsadressePerioder}
            idFromElement={() => Utils._uuid()}
            renderElement={element => <AdresseRad adresseNode={<GeneriskAdresse adresse={element.bostedsadresse} />} periode={element.periode} />}
            amountOfItemsCollapsed={1}
            btnTextCollapsed="Åpne historikk"
            btnTextExpanded="Lukk historikk"
            chevron
            dividers
          />
          <ExpandableList
            header={<AdresseHeader adresseTittel="Postadresse" />}
            elements={postadressePerioder}
            idFromElement={() => Utils._uuid()}
            renderElement={element => <AdresseRad adresseNode={<UstrukturertAdresse adresse={element.postadresse} />} periode={element.periode} />}
            amountOfItemsCollapsed={1}
            btnTextCollapsed="Åpne historikk"
            btnTextExpanded="Lukk historikk"
            chevron
            dividers
          />
          <ExpandableList
            header={<AdresseHeader adresseTittel="Midlertidig adresse" />}
            elements={midlertidigAdressePerioder}
            idFromElement={() => Utils._uuid()}
            renderElement={element => {
              const {
                midlertidigAdresse: { adressetype, strukturertAdresse, ustrukturertAdresse }, periode,
              } = element;
              let adresseNode = null;

              if (adressetype === KV.Koder.AdresseType.STRUKTURERT) adresseNode = <StrukturertAdresse adresse={strukturertAdresse} />;
              else if (adressetype === KV.Koder.AdresseType.USTRUKTURERT) adresseNode = <UstrukturertAdresse adresse={ustrukturertAdresse} />;

              return <AdresseRad adresseNode={adresseNode} periode={periode} />;
            }}
            amountOfItemsCollapsed={1}
            btnTextCollapsed="Åpne historikk"
            btnTextExpanded="Lukk historikk"
            chevron
            dividers
          />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column className="etikett__container">
          <Etiketter.FraSoknad />
          <Etiketter.ArbeidstakersDel />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="9">
          <AnnenAdresse
            redigerbart={redigerbart}
            className="oppgittAdresse"
          />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="5">
          {/* Fødested og land */}
        </Nav.Column>
        <Nav.Column xs="7">
          <UtenlandskIdent
            redigerbart={redigerbart}
          />
        </Nav.Column>
      </Nav.Row>
    </div>
  );
};

export default connector(Person);
