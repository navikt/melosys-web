import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Familiemedlem } from 'Domene';
import { RootState } from 'AppTypes';

import * as Api from '../../../../services/api';
import * as Etiketter from '../etiketter';
import * as Ikoner from '../../../../resources/images';
import * as Mui from '../../../ui';
import * as Nav from '../../../../utils/navFrontend';
import * as Utils from '../../../../utils';
import * as KV from '../../../../kodeverk';

import { behandlingerOperations, behandlingerSelectors } from '../../../../ducks/behandlinger';
import { redigerbartSelectors } from '../../../../ducks/redigerbart';

import ExpandableList from '../../../expandablelist';
import KopierbarTekst from '../kopierbarTekst';

import './familiemedlemmer.css';

interface FamiliemedlemmerEnkeltProps {
  familiemedlem: Familiemedlem,
  erBarn: boolean,
}

export function FamiliemedlemmerEnkelt({ familiemedlem, erBarn }: FamiliemedlemmerEnkeltProps) {
  const {
    sammensattNavn,
    fnr,
    relasjonstype,
    alder,
    borMedBruker,
    sivilstandGyldighetsperiodeFom,
    fnrAnnenForelder,
  } = familiemedlem;

  const renderBarnEtikett = () => (alder < 18 ? (<Etiketter.Under18Aar className="ikon__under18Aar" />) : null);

  return (
    <div aria-label="Enkelt familiemedlem" className="familiemedlemmer__enkelt">
      <Nav.Row>
        <Nav.Column xs="2">{sammensattNavn}</Nav.Column>
        <Nav.Column xs="3">
          <KopierbarTekst>{fnr}</KopierbarTekst>
        </Nav.Column>
        <Nav.Column xs="2">
          {erBarn ? Utils.streng.boolTilNorsk(borMedBruker) : Utils.dato.formatterDatoTilNorsk(sivilstandGyldighetsperiodeFom)}
        </Nav.Column>
        <Nav.Column xs="2">{erBarn ? fnrAnnenForelder : Utils.streng.boolTilNorsk(borMedBruker)}</Nav.Column>
        <Nav.Column xs="3">{erBarn ? renderBarnEtikett() : relasjonstype.term}</Nav.Column>
      </Nav.Row>
    </div>
  );
}

interface FamiliemedlemmerGruppeProps {
  familiemedlemmer: Familiemedlem[],
  ingenFamiliemedlemmerTekst: string,
  overskrift: string,
  kolonneHeadinger: string[],
  erBarn: boolean,
}

export function FamiliemedlemmerGruppe(props: FamiliemedlemmerGruppeProps) {
  const {
    familiemedlemmer, ingenFamiliemedlemmerTekst, overskrift = '', kolonneHeadinger, erBarn,
  } = props;

  return (
    <div>
      <Nav.typo.Undertittel className="familiemedlemmer__gruppeoverskrift">{overskrift}</Nav.typo.Undertittel>
      { familiemedlemmer.length === 0 && ingenFamiliemedlemmerTekst }
      { familiemedlemmer.length !== 0 &&
      <Nav.Row className="header">
        <Nav.Column xs="2">{kolonneHeadinger[0]}</Nav.Column>
        <Nav.Column xs="3">{kolonneHeadinger[1]}</Nav.Column>
        <Nav.Column xs="2">{kolonneHeadinger[2]}</Nav.Column>
        <Nav.Column xs="2">{kolonneHeadinger[3]}</Nav.Column>
        <Nav.Column xs="3">{kolonneHeadinger[4]}</Nav.Column>
      </Nav.Row>
      }
      <section>
        <ExpandableList
          elements={familiemedlemmer}
          renderElement={familiemedlem => <FamiliemedlemmerEnkelt familiemedlem={familiemedlem} erBarn={erBarn} />}
          idFromElement={familiemedlem => familiemedlem.fnr}
          amountOfItemsCollapsed={2}
          btnTextCollapsed="Vis flere"
          btnTextExpanded="Vis færre"
          chevron
          dividers
        />
      </section>
    </div>
  );
}

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  familiemedlemmer: behandlingerSelectors.FamiliemedlemmerSelector(state),
  redigerbart: redigerbartSelectors.PanelerRedigerbartSelector(state),
});
const mapDispatchToProps = (dispatch: any) => ({
  oppdaterBehandling: () => dispatch(behandlingerOperations.oppdaterBehandling()),
});
const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

const Familiemedlemmer = ({
  behandlingID,
  familiemedlemmer,
  oppdaterBehandling,
}: PropsFromRedux) => {
  const [feilmelding, setFeilmelding] = useState('');

  const oppfrisk = async () => {
    try {
      await Api.Saksopplysninger.oppfrisk(behandlingID, { medFamilierelasjoner: true });
      oppdaterBehandling();
    } catch (e) {
      Utils.logger.error(e);
      if (e.status >= 500) setFeilmelding('Kunne ikke hente familierelasjoner');
      else if (e.status >= 400) setFeilmelding(e.body.message);
    }
  };

  const barn = familiemedlemmer
    .filter((familiemedlem: Familiemedlem) => familiemedlem.relasjonstype.kode === KV.Koder.Relasjonsrolle.BARN) || [];
  const ektefellePartnerSamboer = familiemedlemmer
    .filter((familiemedlem: Familiemedlem) => familiemedlem.relasjonstype.kode !== KV.Koder.Relasjonsrolle.BARN) || [];

  return (
    <div className="familiemedlemmer">
      <Etiketter.FraRegister style={{ float: 'right' }} />
      { feilmelding &&
        <Nav.AlertStripe type="advarsel" className="varsel">{feilmelding}</Nav.AlertStripe>}
      { familiemedlemmer.length === 0 &&
        <div className="familiemedlemmer__gruppeoverskrift">
          <Mui.Knappelenke ikon={Ikoner.HentOpplysninger} onClick={oppfrisk}>Hent opplysninger</Mui.Knappelenke>
        </div>}
      { familiemedlemmer.length !== 0 &&
      <FamiliemedlemmerGruppe
        familiemedlemmer={barn}
        ingenFamiliemedlemmerTekst="(Fant ingen barn)"
        overskrift="Barn"
        kolonneHeadinger={['Navn', 'F.nr./d-nr.', 'Bor med bruker', 'F.nr annen forelder', '']}
        erBarn />}
      { familiemedlemmer.length !== 0 &&
      <FamiliemedlemmerGruppe
        familiemedlemmer={ektefellePartnerSamboer}
        ingenFamiliemedlemmerTekst="(Fant ingen ektefelle/partner/samboer)"
        overskrift="Ektefelle/partner/samboer"
        kolonneHeadinger={['Navn', 'F.nr./d-nr.', 'Fra og med', 'Bor med bruker', 'Relasjon']}
        erBarn={false} />}
    </div>
  );
};

export default connector(Familiemedlemmer);
