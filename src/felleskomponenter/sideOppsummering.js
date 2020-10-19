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
import * as Api from '../services/api';
import * as Utils from '../utils';

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
}) => {
  if (!oppsummering) return <div />;

  const [kanEndreBehandlingstema, setKanEndreBehandlingstema] = useState(false);
  const tittel = KV.kodeTilTerm(behandlingstema, MKV.KTObjects.behandlinger.behandlingstema) || '';
  const behandlingsstatus = renderBehandlingsstatus();
  const behandlingID = Utils._toInteger(Utils.queryString.getParam(window.location, 'behandlingID'));

  useEffect(() => {
    hentMuligeBehandlingstema(behandlingID)
      .then(response =>
        setKanEndreBehandlingstema(response.length !== 0))
      .catch(() => setKanEndreBehandlingstema(false));
  }, []);

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
  hentMuligeBehandlingstema: PT.func,
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
  hentMuligeBehandlingstema: Api.Behandlinger.behandling.hentMuligeBehandlingstema,
};

const mapDispatchToProps = dispatch => ({
  visEndreBehandlingstemaDialogHandle: () => dispatch(modalerOperations.visEndreBehandlingstema()),
});

export default connect(null, mapDispatchToProps)(SideOppsummering);
