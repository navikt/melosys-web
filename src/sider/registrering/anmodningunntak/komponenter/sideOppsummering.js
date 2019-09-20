import React from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';
import * as RegistreringContext from '../../state/registreringContext';

import * as KV from '../../../../kodeverk';
import { formatterDatoTilNorsk } from '../../../../utils/dato';
import { fagsakSelectors } from '../../../../ducks/fagsaker';
import { behandlingerOperations, behandlingerSelectors } from '../../../../ducks/behandlinger';
import { avklartefaktaSelectors } from '../../../../ducks/avklartefakta';
import Behandlingsmeny from './behandlingsmeny';
import Behandlingsstatus from './behandlingsstatus';
import Oppsummering from '../../../../felleskomponenter/oppsummering';

import './sideOppsummering.css';

const SideOppsummering = props => {
  const {
    behandlingID,
    behandlingstype,
    fagsak,
    oppsummering,
    person,
    lovvalgsperiodeFom,
    lovvalgsperiodeTom,
    lagreOgLukkHandle,
    tilbakeleggeHandle,
    arbeidsland,
    endreLovvalgsperiodeRedigerbart,
  } = props;

  if (!oppsummering) return <div />;

  const apneTidligereBehandlinger = () => {
    const URI_SOK = `/sok/${props.person.fnr}`;
    window.open(URI_SOK);
  };

  const tittel = KV.kodeTilTerm(behandlingstype, MKV.KTObjects.behandlinger.typer)

  return (
    <section aria-label="oppsummeringer" className="sideOppsummering panelSeksjon">
      <Nav.Panel className="saksbehandling__soknadSammendrag">
        <Nav.Row>
          <Nav.Column xs="12" md="12">
            <div className="oppsummering__menylinje">
              <Behandlingsmeny
                lagreOgLukkHandle={lagreOgLukkHandle}
                tilbakeleggeHandle={tilbakeleggeHandle}
                apneTidligereBehandlinger={apneTidligereBehandlinger}
                redigerbart={endreLovvalgsperiodeRedigerbart}
              />
            </div>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12" md="12">
            <Nav.Undertittel className="soknadSammendrag__header">{tittel}</Nav.Undertittel>
          </Nav.Column>
        </Nav.Row>
        {/* START OPPSUMMERING */}
        <Nav.Row>
          <Nav.Column xs="12">
            {oppsummering && <Oppsummering
              arbeidsland={arbeidsland} // Lovvalgsland
              fagsak={fagsak}
              oppsummering={oppsummering}
              person={person}
              lovvalgsperiodeFom={lovvalgsperiodeFom}
              lovvalgsperiodeTom={lovvalgsperiodeTom}
            />
            }
          </Nav.Column>
        </Nav.Row>
        {/* END OPPSUMMERING */}
        {/* START BEHANDLINGSSTATUS */}
        <Nav.Row>
          <Nav.Column xs="12">
            <Behandlingsstatus behandlingID={behandlingID} />
          </Nav.Column>
        </Nav.Row>
        {/* SLUTT BEHANDLINGSSTATUS */}
      </Nav.Panel>
    </section>
  );
};

SideOppsummering.propTypes = {
  behandlingID: PT.number.isRequired,
  behandlingstype: PT.string.isRequired,
  redigerbart: PT.bool,
  endreLovvalgsperiodeRedigerbart: PT.bool.isRequired,
  fagsak: MPT.Fagsak,
  oppsummering: MPT.Behandlinger.Oppsummering,
  person: MPT.Behandlinger.Saksopplysninger.Person.isRequired,
  lovvalgsperiodeFom: PT.string,
  lovvalgsperiodeTom: PT.string,
  arbeidsland: PT.arrayOf(MPT.Kodeverk),
  lagreOgLukkHandle: PT.func.isRequired,
  tilbakeleggeHandle: PT.func.isRequired,
  tilForsidenHandle: PT.func.isRequired,
  oppdaterBehandlingsStatus: PT.func.isRequired,
};
SideOppsummering.defaultProps = {
  arbeidsland: [],
  redigerbart: false,
  fagsak: undefined,
  oppsummering: undefined,
  lovvalgsperiodeFom: undefined,
  lovvalgsperiodeTom: undefined,
};

const mapStateToProps = state => ({
  fagsak: fagsakSelectors.FagsakSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  person: behandlingerSelectors.PersonSelector(state),
  redigerbart: behandlingerSelectors.RedigerbartSelector(state),
  endreLovvalgsperiodeRedigerbart: behandlingerSelectors.EndreLovvalgsPeriodeRedigerbartSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  lovvalgsperiodeFom: formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeSelector(state).fom),
  lovvalgsperiodeTom: formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeSelector(state).tom),
  arbeidsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
});

const mapDispatchToProps = dispatch => ({
  oppdaterBehandlingsStatus: behandlingsstatus => dispatch(behandlingerOperations.oppdaterBehandlingsStatus(behandlingsstatus)),
});

export default RegistreringContext.connect(mapStateToProps, mapDispatchToProps)(SideOppsummering);
