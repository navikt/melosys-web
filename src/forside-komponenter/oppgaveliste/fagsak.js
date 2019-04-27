import React from 'react';
import * as MPT from '../../proptypes';

import * as Ikoner from '../../resources/images';
import * as Nav from '../../utils/navFrontend';
import * as KV from '../../kodeverk';

import Behandling from './behandling';
import PanelHeader from '../../komponenter/panelHeader/panelHeader';
import EnkeltDato from '../../komponenter/datoOmrade/enkeltDato';

import './fagsak.css';

/**
 * Dette er enkeltlinjen for én sak som inneholder sakstittel og metadata
 * for å gi saksbehandler oversikt over sakens innhold før hun klikker
 * seg inn på den.
 */
const Fagsak = ({ sak }) => {
  const {
    opprettetDato,
    sakstype,
    saksstatus,
    saksnummer,
    behandlingOversikter,
  } = sak;

  const {
    soknadsperiode,
    land,
  } = behandlingOversikter[0];

  const { fom, tom } = soknadsperiode;
  const tittel = `${KV.objektTilTerm(sakstype)}`;
  const routePath = `/saksbehandling/${saksnummer}`;

  const landListeSomStreng = land ? land.join(', ') : '(ukjent)';

  return (
    <Nav.Panel className="fagsak">
      <PanelHeader
        ikon={Ikoner.IkonSak}
        tittel={tittel}
        undertittel="" />
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="12" md="5">
            <dl className="fagsak__meta">
              <dt>Saksstatus:</dt>
              <dd>{KV.objektTilTerm(saksstatus) || '(ukjent)'}</dd>
              <dt>Søknadsperiode: </dt>
              <dd>{fom && <EnkeltDato dato={fom} />} - {tom && <EnkeltDato dato={tom} />}</dd>
            </dl>
          </Nav.Column>
          <Nav.Column xs="12" md="5">
            <dl className="fagsak__meta">
              <dt>Opprettelsesdato:</dt>
              <dd>{<EnkeltDato dato={opprettetDato} /> || '(ukjent)'}</dd>
              <dt>Land:</dt>
              <dd>{landListeSomStreng}</dd>
            </dl>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row className="fagsak__behandlinger">
          {
            behandlingOversikter.map(behandling => {
              const link = `${routePath}/?behandlingID=${behandling.behandlingID}`;
              return (<Behandling key={behandling.behandlingID} behandling={behandling} link={link} />);
            })
          }
        </Nav.Row>
      </Nav.Container>
    </Nav.Panel>
  );
};

Fagsak.propTypes = {
  sak: MPT.FagsakOppsummering,
};

Fagsak.defaultProps = {
  sak: {},
};

export default Fagsak;
