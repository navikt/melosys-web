import React from 'react';
import { Link } from 'react-router-dom';

import * as MPT from '../../../proptypes/index';
import * as Ikoner from '../../../resources/images/index';
import * as Nav from '../../../utils/navFrontend';

import PanelHeader from '../../panelHeader/panelHeader';
import EnkeltDato from '../../datoOmrade/enkeltDato';

import './sakEnkeltLinje.css';

/**
 * Dette er enkeltlinjen for én sak som inneholder sakstittel og metadata
 * for å gi saksbehandler en oversikt over sakens innhold før hun klikker
 * seg inn på den.
 */
const SakEnkeltLinje = ({ sak }) => {
  const {
    sammensattNavn, sakstype, saksnummer, behandling, aktivTil, soknadsperiode = {},
  } = sak;

  const { status } = behandling;
  const { fom = null, tom = null } = soknadsperiode;
  const tittel = `${sakstype.term} - ${sammensattNavn}`;
  const link = `/saksbehandling/${saksnummer}`;

  return (
    <Link to={link} className="sakEnkeltLinje__link">
      <Nav.Panel className="sakEnkeltLinje">
        <PanelHeader
          ikon={Ikoner.IkonSak}
          tittel={tittel}
          undertittel={
            <Nav.Row>
              <Nav.Column xs="12" md="6">
                <dl className="sakEnkeltLinje__meta">
                  <dt className="sakEnkeltLinje__meta__term">Status:</dt>
                  <dd className="sakEnkeltLinje__meta__detalj">{status.term}</dd>
                  <dt className="sakEnkeltLinje__meta__term">Frist:</dt>
                  <dd className="sakEnkeltLinje__meta__detalj">{aktivTil}</dd>
                </dl>
              </Nav.Column>
              <Nav.Column xs="12" md="6">
                <dl className="sakEnkeltLinje__meta">
                  <dt className="sakEnkeltLinje__meta__term">Søknadsperiode: </dt>
                  <dd className="sakEnkeltLinje__meta__detalj">{fom && <EnkeltDato dato={fom} />} - {tom && <EnkeltDato dato={tom} />}</dd>
                  <dt className="sakEnkeltLinje__meta__term">Land:</dt>
                  <dd className="sakEnkeltLinje__meta__detalj">TODO fra søknaden</dd>
                </dl>
              </Nav.Column>
            </Nav.Row>
          }
        />
      </Nav.Panel>
    </Link>
  );
};

SakEnkeltLinje.propTypes = {
  sak: MPT.SakEnkeltLinje,
};

SakEnkeltLinje.defaultProps = {
  sak: {},
};

export default SakEnkeltLinje;
