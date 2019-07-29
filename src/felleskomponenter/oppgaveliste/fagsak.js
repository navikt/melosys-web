import React from 'react';
import * as MKV from 'melosys-kodeverk';

import * as MPT from '../../proptypes';
import * as Ikoner from '../../resources/images';
import * as Nav from '../../utils/navFrontend';
import * as KV from '../../kodeverk';

import Behandling from './behandling';
import PanelHeader from '../panelHeader/panelHeader';
import EnkeltDato from '../datoOmrade/enkeltDato';
import { DatoOmradeDescription } from '../datoOmrade/datoOmrade';

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
    behandlingstype,
    soknadsperiode,
    land,
  } = behandlingOversikter[0];
  const tittel = `${KV.objektTilTerm(sakstype)}`;
  let routePath = `/saksbehandling/${saksnummer}`;
  if (behandlingstype.kode === MKV.Koder.behandlinger.typer.REGISTRERING_UNNTAK_NORSK_TRYGD || behandlingstype.kode === MKV.Koder.behandlinger.typer.UTL_MYND_UTPEKT_SEG_SELV) {
    routePath = `/registrering/${saksnummer}`;
  }
  const landListeSomStreng = land ? land.join(', ') : '(ukjent)';
  const customMargin = { marginLeft: '1em' };
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
              <DatoOmradeDescription tekst="Søknadsperiode: " periode={soknadsperiode} />
            </dl>
          </Nav.Column>
          <Nav.Column xs="12" md="4">
            <dl className="fagsak__meta">
              <dt>Opprettelsesdato:</dt>
              <dd>{<EnkeltDato dato={opprettetDato} /> || '(ukjent)'}</dd>
              <dt>Land:</dt>
              <dd>{landListeSomStreng}</dd>
            </dl>
          </Nav.Column>
          <Nav.Column xs="12" md="3">
            <dl style={customMargin} className="fagsak__meta">
              <dt>&nbsp;</dt>
              <dd>&nbsp;</dd>
              <dt>Saksnummer:</dt>
              <dd>{saksnummer}</dd>
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
  sak: MPT.BehandligOversikt,
};

Fagsak.defaultProps = {
  sak: {},
};

export default Fagsak;
