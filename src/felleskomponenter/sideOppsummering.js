import React, { useEffect, useState } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import MKV from '../melosyskodeverk';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes';
import * as KV from '../kodeverk';

import Oppsummering from './oppsummering';

import './sideOppsummering.css';
import { modalerOperations } from '../ducks/modaler';
import { behandlingstemaOperations } from '../ducks/behandlingstema';
import { behandlingerSelectors } from '../ducks/behandlinger';

const SideOppsummering = ({
  arbeidsland,
  oppholdsland,
  behandlingstema,
  fagsak,
  oppsummering,
  person,
  lovvalgsperiodeFom,
  lovvalgsperiodeTom,
  lovvalgsland,
  renderBehandlingsmeny,
  renderBehandlingsstatus,
  behandlingsgrunnlagPeriodeFom,
  behandlingsgrunnlagPeriodeTom,
  periodeLabel,
  visEndreBehandlingstemaDialogHandle,
  hentMuligeBehandlingstema,
  behandlingID,
}) => {
  if (!oppsummering) return <div />;

  const [kanEndreBehandlingstema, setKanEndreBehandlingstema] = useState(false);
  const tittel = KV.kodeTilTerm(behandlingstema, MKV.KTObjects.behandlinger.behandlingstema) || '';
  const behandlingsstatus = renderBehandlingsstatus();

  useEffect(() => {
    if (behandlingID > 0) {
      hentMuligeBehandlingstema(behandlingID)
        .then(response =>
          setKanEndreBehandlingstema(response && response.length !== 0));
    }
  }, [behandlingID]);

  return (
    <section aria-label="oppsummeringer" className="sideOppsummering panelSeksjon">
      <Nav.Panel className="saksbehandling__soknadSammendrag">
        <Nav.Row>
          <Nav.Column xs="12" md="12">
            <div className="oppsummering__menylinje">
              {
                renderBehandlingsmeny()
              }
            </div>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12" md="12">
            <Nav.typo.Undertittel className={kanEndreBehandlingstema ? 'oppsummering__header' : ''} onClick={kanEndreBehandlingstema ? visEndreBehandlingstemaDialogHandle : null}>
              {tittel}
            </Nav.typo.Undertittel>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12">
            {oppsummering && <Oppsummering
              arbeidsland={arbeidsland}
              oppholdsland={oppholdsland}
              lovvalgsland={lovvalgsland}
              fagsak={fagsak}
              oppsummering={oppsummering}
              person={person}
              lovvalgsperiodeFom={lovvalgsperiodeFom}
              lovvalgsperiodeTom={lovvalgsperiodeTom}
              behandlingsgrunnlagPeriodeFom={behandlingsgrunnlagPeriodeFom}
              behandlingsgrunnlagPeriodeTom={behandlingsgrunnlagPeriodeTom}
              periodeLabel={periodeLabel}
            />
            }
          </Nav.Column>
        </Nav.Row>
        {
          behandlingsstatus &&
          <Nav.Row>
            <Nav.Column xs="12">
              {
                behandlingsstatus
              }
            </Nav.Column>
          </Nav.Row>
        }
      </Nav.Panel>
    </section>
  );
};

SideOppsummering.propTypes = {
  behandlingstema: PT.string.isRequired,
  redigerbart: PT.bool,
  fagsak: MPT.Fagsak,
  oppsummering: MPT.Behandlinger.Oppsummering,
  person: MPT.Behandlinger.Saksopplysninger.Person.isRequired,
  lovvalgsperiodeFom: PT.string,
  lovvalgsperiodeTom: PT.string,
  lovvalgsland: MPT.Kodeverk,
  renderBehandlingsmeny: PT.func.isRequired,
  renderBehandlingsstatus: PT.func.isRequired,
  arbeidsland: PT.arrayOf(MPT.Kodeverk),
  oppholdsland: PT.arrayOf(MPT.Kodeverk),
  behandlingsgrunnlagPeriodeFom: PT.string,
  behandlingsgrunnlagPeriodeTom: PT.string,
  periodeLabel: PT.string,
  visEndreBehandlingstemaDialogHandle: PT.func.isRequired,
  hentMuligeBehandlingstema: PT.func.isRequired,
  behandlingID: PT.number.isRequired,
};

SideOppsummering.defaultProps = {
  lovvalgsland: {},
  arbeidsland: [],
  oppholdsland: [],
  redigerbart: false,
  fagsak: undefined,
  oppsummering: undefined,
  lovvalgsperiodeFom: undefined,
  lovvalgsperiodeTom: undefined,
  behandlingsgrunnlagPeriodeFom: undefined,
  behandlingsgrunnlagPeriodeTom: undefined,
  periodeLabel: 'Søknadsperiode',
};

const mapStateToProps = state => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});

const mapDispatchToProps = dispatch => ({
  visEndreBehandlingstemaDialogHandle: () => dispatch(modalerOperations.visEndreBehandlingstema()),
  hentMuligeBehandlingstema: behandlingID => dispatch(behandlingstemaOperations.hentMuligeBehandlingstema(behandlingID)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SideOppsummering);
