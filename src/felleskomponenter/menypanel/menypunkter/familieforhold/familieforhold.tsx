import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Familiemedlem } from 'Domene';
import { RootState } from 'AppTypes';

import * as Etiketter from '../etiketter';
import * as Nav from '../../../../utils/navFrontend';
import * as Utils from '../../../../utils';

import { behandlingerSelectors } from '../../../../ducks/behandlinger';
import { redigerbartSelectors } from '../../../../ducks/redigerbart';

import ExpandableList from '../../../expandablelist';

import './familieforhold.css';

function filtrerFamiliemedlemmer(familiemedlemmer: Familiemedlem[], finnBarn: boolean) {
  return familiemedlemmer.filter(familiemedlem =>
    (finnBarn && familiemedlem.relasjonstype.kode === 'BARN') || (!finnBarn && familiemedlem.relasjonstype.kode !== 'BARN'));
}

function renderBarnEtikett(alder: number) {
  return alder < 18 ? (<Etiketter.Under18Aar />) : (<span />);
}

interface FamilieforholdEnkeltProps {
  familiemedlem: Familiemedlem,
  erBarn: boolean,
}

export function FamilieforholdEnkelt({ familiemedlem, erBarn }: FamilieforholdEnkeltProps) {
  const {
    sammensattNavn,
    fnr,
    relasjonstype,
    alder,
    borMedBruker,
    sivilstandGyldighetsperiodeFom,
    fnrAnnenForelder,
  } = familiemedlem;

  return (
    <div className="familieforhold__enkelt" aria-label="Enkelt familiemedlem">
      <Nav.Row>
        <Nav.Column xs="3">{sammensattNavn}</Nav.Column>
        <Nav.Column xs="2">{fnr}</Nav.Column>
        <Nav.Column xs="2">{erBarn ? Utils.streng.boolTilNorsk(borMedBruker) : sivilstandGyldighetsperiodeFom}</Nav.Column>
        <Nav.Column xs="2">{erBarn ? fnrAnnenForelder : Utils.streng.boolTilNorsk(borMedBruker)}</Nav.Column>
        <Nav.Column xs="3">{erBarn ? renderBarnEtikett(alder) : relasjonstype.term}</Nav.Column>
      </Nav.Row>
    </div>
  );
}

interface FamilieforholdGruppeProps {
  familiemedlemmer: Familiemedlem[],
  overskrift: string,
  kolonner: string[],
  erBarn: boolean,
}

export function FamilieforholdGruppe(props: FamilieforholdGruppeProps) {
  const {
    familiemedlemmer, overskrift = '', kolonner, erBarn,
  } = props;

  return (
    <div>
      <Nav.typo.Undertittel className="familieforhold__gruppeoverskrift">{overskrift}</Nav.typo.Undertittel>
      <Nav.Row>
        <Nav.Column xs="3">{kolonner[0]}</Nav.Column>
        <Nav.Column xs="2">{kolonner[1]}</Nav.Column>
        <Nav.Column xs="2">{kolonner[2]}</Nav.Column>
        <Nav.Column xs="2">{kolonner[3]}</Nav.Column>
        <Nav.Column xs="3">{kolonner[4]}</Nav.Column>
      </Nav.Row>
      <section className="familieforholdgruppe__liste">
        {
          familiemedlemmer.length > 0 &&
          <ExpandableList
            elements={familiemedlemmer}
            renderElement={familiemedlem => <FamilieforholdEnkelt familiemedlem={familiemedlem} erBarn={erBarn} />}
            idFromElement={familiemedlem => familiemedlem.fnr}
            amountOfItemsCollapsed={2}
            btnTextCollapsed="Vis flere"
            btnTextExpanded="Vis færre"
            chevron
            dividers
          />
        }
        { familiemedlemmer.length === 0 && '(ingen data funnet)'}
      </section>
    </div>
  );
}

const mapStateToProps = (state: RootState) => ({
  familiemedlemmer: behandlingerSelectors.FamiliemedlemmerSelector(state),
  redigerbart: redigerbartSelectors.PanelerRedigerbartSelector(state),
});
const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export const Familieforhold = ({
  familiemedlemmer,
}: PropsFromRedux) => {
  if (Object.keys(familiemedlemmer).length === 0) { return null; }

  return (
    <div className="familieforhold">
      <FamilieforholdGruppe
        familiemedlemmer={filtrerFamiliemedlemmer(familiemedlemmer, true)}
        overskrift="Barn"
        kolonner={['Navn', 'F.nr./d-nr.', 'Bor med bruker', 'F.nr annen forelder', '']}
        erBarn />
      <FamilieforholdGruppe
        familiemedlemmer={filtrerFamiliemedlemmer(familiemedlemmer, false)}
        overskrift="Ektefelle/partner/samboer"
        kolonner={['Navn', 'F.nr./d-nr.', 'Fra og med', 'Bor med bruker', 'Relasjon']}
        erBarn={false} />
    </div>
  );
};

export default connector(Familieforhold);
