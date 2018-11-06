import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import PT from 'prop-types';

import * as MPT from '../../../proptypes/index';
import * as Ikoner from '../../../resources/images/index';
import * as Nav from '../../../utils/navFrontend';

import { kodeverkObjektTilTerm } from '../../../utils/kodeverk';

import PanelHeader from '../../panelHeader/panelHeader';
import EnkeltDato from '../../datoOmrade/enkeltDato';
import { formatterDatoTilNorsk } from '../../../utils/dato';

import './sakEnkeltLinje.css';

const SaksLinjeWrapper = ({ link, stengt, children }) => (
  stengt ?
    <div>
      {children}
    </div>
    :
    <Link to={link} className="sakEnkeltLinje__link">
      {children}
    </Link>
);

SaksLinjeWrapper.propTypes = {
  link: PT.string.isRequired,
  stengt: PT.bool.isRequired,
  children: PT.node.isRequired,
};

/**
 * Dette er enkeltlinjen for én sak som inneholder sakstittel og metadata
 * for å gi saksbehandler en hent over sakens innhold før hun klikker
 * seg inn på den.
 */
const SakEnkeltLinje = ({ sak }) => {
  const {
    sammensattNavn,
    sakstype,
    saksnummer,
    behandling,
    aktivTil,
    soknadsperiode,
    land,
  } = sak;

  const {
    sisteOpplysningerHentetDato,
    erUnderOppdatering,
  } = behandling;

  const { behandlingsstatus } = behandling;
  const { fom, tom } = soknadsperiode;
  const tittel = `${kodeverkObjektTilTerm(sakstype)} - ${sammensattNavn}`;
  const link = `/saksbehandling/${saksnummer}`;

  const landListeSomStreng = land ? land.join(', ') : '(ukjent)';
  const oppdateringStatus = erUnderOppdatering && '(oppdateres nå)';

  const cl = classNames({
    sakEnkeltLinje: true,
    sakEnkeltLinje__stengt: erUnderOppdatering,
  });

  return (
    <SaksLinjeWrapper link={link} stengt={erUnderOppdatering}>
      <Nav.Panel className={cl}>
        <PanelHeader
          ikon={Ikoner.IkonSak}
          tittel={tittel}
          undertittel={
            <Nav.Row>
              <Nav.Column xs="12" md="6">
                <dl className="sakEnkeltLinje__meta">
                  <dt className="sakEnkeltLinje__meta__term">Status:</dt>
                  <dd className="sakEnkeltLinje__meta__detalj">{kodeverkObjektTilTerm(behandlingsstatus) || '(ukjent)'}</dd>
                  <dt className="sakEnkeltLinje__meta__term">Frist:</dt>
                  <dd className="sakEnkeltLinje__meta__detalj">{<EnkeltDato dato={aktivTil} /> || '(ukjent)'}</dd>
                  <dt className="sakEnkeltLinje__meta__term">Sist oppdatert:</dt>
                  <dd className="sakEnkeltLinje__meta__detalj">{oppdateringStatus || formatterDatoTilNorsk(sisteOpplysningerHentetDato, true)}</dd>
                </dl>
              </Nav.Column>
              <Nav.Column xs="12" md="6">
                <dl className="sakEnkeltLinje__meta">
                  <dt className="sakEnkeltLinje__meta__term">Søknadsperiode: </dt>
                  <dd className="sakEnkeltLinje__meta__detalj">{fom && <EnkeltDato dato={fom} />} - {tom && <EnkeltDato dato={tom} />}</dd>
                  <dt className="sakEnkeltLinje__meta__term">Land:</dt>
                  <dd className="sakEnkeltLinje__meta__detalj">{landListeSomStreng}</dd>
                </dl>
              </Nav.Column>
            </Nav.Row>
          }
        />
      </Nav.Panel>
    </SaksLinjeWrapper>
  );
};

SakEnkeltLinje.propTypes = {
  sak: MPT.SaksbehandlingOppgave,
};

SakEnkeltLinje.defaultProps = {
  sak: {},
};

export default SakEnkeltLinje;
