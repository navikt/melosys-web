import React from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes';
import * as KV from '../kodeverk';

import Oppsummering from './oppsummering';

import './sideOppsummering.css';

const SideOppsummering = ({
  behandlingstype,
  fagsak,
  oppsummering,
  person,
  lovvalgsperiodeFom,
  lovvalgsperiodeTom,
  lovvalgsland,
  renderBehandlingsmeny,
  renderBehandlingsstatus,
}) => {
  if (!oppsummering) return <div />;

  const tittel = KV.kodeTilTerm(behandlingstype, MKV.KTObjects.behandlinger.behandlingstyper) || '';

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
            <Nav.Undertittel className="soknadSammendrag__header">{tittel}</Nav.Undertittel>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12">
            {oppsummering && <Oppsummering
              lovvalgsland={lovvalgsland}
              fagsak={fagsak}
              oppsummering={oppsummering}
              person={person}
              lovvalgsperiodeFom={lovvalgsperiodeFom}
              lovvalgsperiodeTom={lovvalgsperiodeTom}
            />
            }
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12">
            {
              renderBehandlingsstatus()
            }
          </Nav.Column>
        </Nav.Row>
      </Nav.Panel>
    </section>
  );
};

SideOppsummering.propTypes = {
  behandlingstype: PT.string.isRequired,
  redigerbart: PT.bool,
  fagsak: MPT.Fagsak,
  oppsummering: MPT.Behandlinger.Oppsummering,
  person: MPT.Behandlinger.Saksopplysninger.Person.isRequired,
  lovvalgsperiodeFom: PT.string,
  lovvalgsperiodeTom: PT.string,
  lovvalgsland: PT.arrayOf(MPT.Kodeverk),
  renderBehandlingsmeny: PT.func.isRequired,
  renderBehandlingsstatus: PT.func.isRequired,
};

SideOppsummering.defaultProps = {
  lovvalgsland: [],
  redigerbart: false,
  fagsak: undefined,
  oppsummering: undefined,
  lovvalgsperiodeFom: undefined,
  lovvalgsperiodeTom: undefined,
};

export default SideOppsummering;
