import React from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes';
import * as KV from '../kodeverk';

import Oppsummering from './oppsummering';

import './sideOppsummering.css';

const SideOppsummering = ({
  arbeidsland,
  behandlingstype,
  fagsak,
  oppsummering,
  person,
  lovvalgsperiodeFom,
  lovvalgsperiodeTom,
  lovvalgsland,
  renderBehandlingsmeny,
  renderBehandlingsstatus,
  soknadsperiodeFom,
  soknadsperiodeTom,
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
            <Nav.typo.Undertittel className="soknadSammendrag__header">{tittel}</Nav.typo.Undertittel>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12">
            {oppsummering && <Oppsummering
              arbeidsland={arbeidsland}
              lovvalgsland={lovvalgsland}
              fagsak={fagsak}
              oppsummering={oppsummering}
              person={person}
              lovvalgsperiodeFom={lovvalgsperiodeFom}
              lovvalgsperiodeTom={lovvalgsperiodeTom}
              soknadsperiodeFom={soknadsperiodeFom}
              soknadsperiodeTom={soknadsperiodeTom}
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
  lovvalgsland: MPT.Kodeverk,
  renderBehandlingsmeny: PT.func.isRequired,
  renderBehandlingsstatus: PT.func.isRequired,
  arbeidsland: PT.arrayOf(MPT.Kodeverk),
  soknadsperiodeFom: PT.string,
  soknadsperiodeTom: PT.string,
};

SideOppsummering.defaultProps = {
  lovvalgsland: {},
  arbeidsland: [],
  redigerbart: false,
  fagsak: undefined,
  oppsummering: undefined,
  lovvalgsperiodeFom: undefined,
  lovvalgsperiodeTom: undefined,
  soknadsperiodeFom: undefined,
  soknadsperiodeTom: undefined,
};

export default SideOppsummering;
