import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as MPT from '../../proptypes';
import * as Ikoner from '../../resources/images';
import * as Nav from '../../utils/navFrontend';
import * as KV from '../../kodeverk';

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
    soknadsperiode,
    land,
    fnr,
  } = sak;

  const {
    behandlingID,
    sisteOpplysningerHentetDato,
    erUnderOppdatering,
    behandlingsstatus,
    behandlingstype,
    registrertDato,
  } = behandling;

  const { fom, tom } = soknadsperiode;
  const tittel = `${KV.objektTilTerm(sakstype)} - ${sammensattNavn} - ${fnr}`;
  let rute = 'saksbehandling';
  if (behandlingstype.kode === MKV.Koder.behandlinger.typer.REGISTRERING_UNNTAK_NORSK_TRYGD || behandlingstype.kode === MKV.Koder.behandlinger.typer.UTL_MYND_UTPEKT_SEG_SELV) {
    rute = 'registrering';
  }
  const link = `/${rute}/${saksnummer}/?behandlingID=${behandlingID}`;
  const landListeSomStreng = land ? land.join(', ') : '(ukjent)';
  const oppdateringStatus = erUnderOppdatering && '(oppdateres nå)';

  const cl = classNames({
    behandlingOppgave: true,
    behandlingOppgave__stengt: erUnderOppdatering,
  });

  return (
    <BehandlingOppgavesLinjeWrapper link={link} stengt={erUnderOppdatering}>
      <Nav.Panel className={cl}>
        <PanelHeader
          ikon={Ikoner.IkonSak}
          tittel={tittel}
          undertittel={
            <Fragment>
              <div className="behandlingOppgave__info">
                <Nav.Row>
                  <dl className="behandlingOppgave__meta">
                    <Nav.Column xs="12" md="5">
                      <dt className="behandlingOppgave__meta__term">Behandlingstype:</dt>
                      <dd className="behandlingOppgave__meta__detalj">{KV.objektTilTerm(behandlingstype) || '(ukjent)'}</dd>
                    </Nav.Column>
                    <Nav.Column xs="12" md="7">
                      <dt className="behandlingOppgave__meta__term">Søknadsperiode: </dt>
                      <dd className="behandlingOppgave__meta__detalj">{fom && <EnkeltDato dato={fom} />} - {tom && <EnkeltDato dato={tom} />}</dd>
                    </Nav.Column>
                  </dl>
                </Nav.Row>

                <Nav.Row>
                  <dl className="behandlingOppgave__meta">
                    <Nav.Column xs="12" md="5">
                      <dt className="behandlingOppgave__meta__term">Behandlingsstatus:</dt>
                      <dd className="behandlingOppgave__meta__detalj">{KV.objektTilTerm(behandlingsstatus) || '(ukjent)'}</dd>
                    </Nav.Column>
                    <Nav.Column xs="12" md="5">
                      <dt className="behandlingOppgave__meta__term">Land:</dt>
                      <dd className="behandlingOppgave__meta__detalj">{landListeSomStreng}</dd>
                    </Nav.Column>
                    <Nav.Column xs="12" md="2">
                      <dt className="behandlingOppgave__meta__term">Saksnr:</dt>
                      <dd className="behandlingOppgave__meta__detalj">{saksnummer || '(ukjent)'}</dd>
                    </Nav.Column>
                  </dl>
                </Nav.Row>

                <Nav.Row>
                  <dl className="behandlingOppgave__meta">
                    <Nav.Column xs="12" md="5">
                      <dt className="behandlingOppgave__meta__term">Opprettelsesdato:</dt>
                      <dd className="behandlingOppgave__meta__detalj">{<EnkeltDato dato={registrertDato} /> || '(ukjent)'}</dd>
                    </Nav.Column>
                    <Nav.Column xs="12" md="5">
                      <dt className="behandlingOppgave__meta__term">Sist oppdatert:</dt>
                      <dd className="behandlingOppgave__meta__detalj">{oppdateringStatus || formatterDatoTilNorsk(sisteOpplysningerHentetDato, true)}</dd>
                    </Nav.Column>
                    <Nav.Column xs="12" md="2">
                      <dt className="behandlingOppgave__meta__term">Frist:</dt>
                      <dd className="behandlingOppgave__meta__detalj">{<EnkeltDato dato={aktivTil} /> || '(ukjent)'}</dd>
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
