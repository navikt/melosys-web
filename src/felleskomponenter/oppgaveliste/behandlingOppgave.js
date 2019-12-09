import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import PT from 'prop-types';

import * as MPT from '../../proptypes';
import * as Ikoner from '../../resources/images';
import * as Nav from '../../utils/navFrontend';
import * as KV from '../../kodeverk';
import * as Utils from '../../utils';

import PanelHeader from '../panelHeader/panelHeader';
import EnkeltDato from '../datoOmrade/enkeltDato';
import { formatterDatoTilNorsk } from '../../utils/dato';

import './behandlingOppgave.css';

const BehandlingOppgavesLinjeWrapper = ({ link, stengt, children }) => (
  stengt ?
    <div>
      {children}
    </div>
    :
    <Link to={link} className="behandlingOppgave__link">
      {children}
    </Link>
);

BehandlingOppgavesLinjeWrapper.propTypes = {
  link: PT.string.isRequired,
  stengt: PT.bool.isRequired,
  children: PT.node.isRequired,
};

/**
 * Dette er enkeltlinjen for én sak som inneholder sakstittel og metadata
 * for å gi saksbehandler en hent over sakens innhold før hun klikker
 * seg inn på den.
 */
const BehandlingOppgave = ({ sak }) => {
  const {
    sammensattNavn,
    sakstype,
    saksnummer,
    behandling,
    aktivTil,
    periode,
    land,
    fnr,
  } = sak;

  const {
    behandlingID,
    erUnderOppdatering,
    behandlingsstatus,
    behandlingstype,
    registrertDato,
    endretDato,
    svarFrist,
  } = behandling;

  const { fom, tom } = periode;
  const tittel = `${KV.objektTilTerm(sakstype)} - ${sammensattNavn} - ${fnr}`;
  const link = Utils.url.lagUrl(saksnummer, behandlingID, behandlingstype.kode);
  const landListeSomStreng = land ? land.join(', ') : '(ukjent)';
  const oppdateringStatus = erUnderOppdatering && '(oppdateres nå)';

  const cl = classNames({
    behandlingOppgave: true,
    behandlingOppgave__stengt: erUnderOppdatering,
  });

  return (
    <BehandlingOppgavesLinjeWrapper link={link} stengt={erUnderOppdatering}>
      <Nav.Panel data-cy-behandlingstype={behandlingstype.kode} className={cl}>
        <PanelHeader
          ikon={Ikoner.IkonSak}
          tittel={tittel}
          undertittel={
            <Fragment>
              <div className="behandlingOppgave__info">
                <Nav.Row className="uthevetRad">
                  <dl className="behandlingOppgave__meta">
                    <Nav.Column xs="12" md="8">
                      <dt className="behandlingOppgave__meta__term">Behandlingstype:</dt>
                      <dd className="behandlingOppgave__meta__detalj">{KV.objektTilTerm(behandlingstype) || '(ukjent)'}</dd>
                    </Nav.Column>
                    <Nav.Column xs="12" md="4">
                      <dt className="behandlingOppgave__meta__term">Frist:</dt>
                      <dd className="behandlingOppgave__meta__detalj"><EnkeltDato dato={aktivTil} /></dd>
                    </Nav.Column>
                  </dl>
                </Nav.Row>

                <Nav.Row className="uthevetRad">
                  <dl className="behandlingOppgave__meta">
                    <Nav.Column xs="12" md="8">
                      <dt className="behandlingOppgave__meta__term">Behandlingsstatus:</dt>
                      <dd className="behandlingOppgave__meta__detalj">{KV.objektTilTerm(behandlingsstatus) || '(ukjent)'}</dd>
                    </Nav.Column>
                    <Nav.Column xs="12" md="4">
                      <dt className="behandlingOppgave__meta__term">Svarfrist:</dt>
                      <dd className="behandlingOppgave__meta__detalj"><EnkeltDato dato={svarFrist} /></dd>
                    </Nav.Column>
                  </dl>
                </Nav.Row>

                <Nav.Row>
                  <dl className="behandlingOppgave__meta">
                    <Nav.Column xs="12" md="8">
                      <dt className="behandlingOppgave__meta__term">Søknadsperiode: </dt>
                      <dd className="behandlingOppgave__meta__detalj">{fom && <EnkeltDato dato={fom} />} - {tom && <EnkeltDato dato={tom} />}</dd>
                    </Nav.Column>
                    <Nav.Column xs="12" md="4">
                      <dt className="behandlingOppgave__meta__term">Sist oppdatert:</dt>
                      <dd className="behandlingOppgave__meta__detalj">{oppdateringStatus || formatterDatoTilNorsk(endretDato)}</dd>
                    </Nav.Column>
                  </dl>
                </Nav.Row>

                <Nav.Row>
                  <dl className="behandlingOppgave__meta">
                    <Nav.Column xs="12" md="8">
                      <dt className="behandlingOppgave__meta__term">Land:</dt>
                      <dd className="behandlingOppgave__meta__detalj">{landListeSomStreng}</dd>
                    </Nav.Column>
                    <Nav.Column xs="12" md="4">
                      <dt className="behandlingOppgave__meta__term">Opprettelsesdato:</dt>
                      <dd className="behandlingOppgave__meta__detalj">{<EnkeltDato dato={registrertDato} /> || '(ukjent)'}</dd>
                    </Nav.Column>
                  </dl>
                </Nav.Row>
              </div>
            </Fragment>
          }
        />
      </Nav.Panel>
    </BehandlingOppgavesLinjeWrapper>
  );
};

BehandlingOppgave.propTypes = {
  sak: MPT.SaksbehandlingOppgave,
};

BehandlingOppgave.defaultProps = {
  sak: {},
};

export default BehandlingOppgave;
