import React from 'react';

import * as MPT from '../../../proptypes/index';
import * as Ikoner from '../../../resources/images/index';
import * as Nav from '../../../utils/navFrontend';

import { kodeverkObjektTilTerm } from '../../../utils/kodeverk';

import Behandling from './behandling';
import PanelHeader from '../../panelHeader/panelHeader';
import EnkeltDato from '../../datoOmrade/enkeltDato';
import { formatterDatoTilNorsk } from '../../../utils/dato';

import './fagsak.css';

/**
 * Dette er enkeltlinjen for én sak som inneholder sakstittel og metadata
 * for å gi saksbehandler en hent over sakens innhold før hun klikker
 * seg inn på den.
 */
const Fagsak = ({ sak }) => {
  const {
    sammensattNavn,
    opprettetDato,
    sakstype,
    saksstatus,
    saksnummer,
    behandlinger,
    aktivTil,
  } = sak;

  const {
    sisteOpplysningerHentetDato,
    erUnderOppdatering,
    soknadsperiode,
    land,
  } = behandlinger[0];

  const { fom, tom } = soknadsperiode;
  const tittel = `${kodeverkObjektTilTerm(sakstype)} - ${sammensattNavn}`;
  const link = `/saksbehandling/${saksnummer}`;

  const landListeSomStreng = land ? land.join(', ') : '(ukjent)';
  const oppdateringStatus = erUnderOppdatering && '(oppdateres nå)';

  return (
    <Nav.Panel className="fagsak">
      <PanelHeader
        ikon={Ikoner.IkonSak}
        tittel={tittel}
        undertittel="" />
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="12" md="4">
            <dl className="fagsak__meta">
              <dt>Saksstatus:</dt>
              <dd>{kodeverkObjektTilTerm(saksstatus) || '(ukjent)'}</dd>
              <dt>Registrert dato:</dt>
              <dd>{<EnkeltDato dato={opprettetDato} /> || '(ukjent)'}</dd>
              <dt>Sist oppdatert:</dt>
              <dd>{oppdateringStatus || formatterDatoTilNorsk(sisteOpplysningerHentetDato, true)}</dd>
            </dl>
          </Nav.Column>
          <Nav.Column xs="12" md="4">
            <dl className="fagsak__meta">
              <dt>Søknadsperiode: </dt>
              <dd>{fom && <EnkeltDato dato={fom} />} - {tom && <EnkeltDato dato={tom} />}</dd>
              <dt>Aktiv til:</dt>
              <dd>{<EnkeltDato dato={aktivTil} /> || '(ukjent)'}</dd>
              <dt>Land:</dt>
              <dd>{landListeSomStreng}</dd>
            </dl>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row className="fagsak__behandlinger">
          {
            behandlinger.map(behandling => <Behandling behandling={behandling} link={link} />)
          }
        </Nav.Row>
      </Nav.Container>
    </Nav.Panel>
  );
};

Fagsak.propTypes = {
  sak: MPT.SaksbehandlingOppgave,
};

Fagsak.defaultProps = {
  sak: {},
};

export default Fagsak;
