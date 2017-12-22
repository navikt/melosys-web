import React from 'react';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import moment from 'moment';

import * as MPT from '../../proptypes/';
import * as Nav from '../../utils/navFrontend';
import * as Ikon from '../../resources/images/index';

import EnkeltDato from '../datoOmrade/enkeltDato';

import './sokListeEnkeltlinje.css';

function SokListeEnkeltlinje({ sak }) {
  const {
    saksnummer, fnr, sammensattNavn, registrertDato, status,
  } = sak;
  const link = `/saksbehandling/${saksnummer}`;
  const ikon = sak.kjoenn === 'M' ? Ikon.Mann : Ikon.Kvinne;
  const ikonAlt = sak.kjoenn === 'M' ? 'mann' : 'kvinne';

  const sakErNy = (moment() - moment(registrertDato)) < 5000;
  const cssKlasser = classnames({ sokliste__enkeltlinje: true, sakErNy });

  return (
    <div className={cssKlasser}>
      <Link to={link} className="enkeltlinje__link">
        <Nav.Panel className="enkeltlinje__panel">
          <div className="enkeltlinje__kjoenn">
            <img src={ikon} alt={`Ikon for ${ikonAlt}`} className="kjonn__ikon" />
          </div>
          <div className="enkeltlinje__info">
            <Nav.Undertittel>{sammensattNavn}</Nav.Undertittel>
            <Nav.Element>Fødselsnr: {fnr}</Nav.Element>
            <Nav.UndertekstBold>Saksnummer: {saksnummer}</Nav.UndertekstBold>
            <Nav.UndertekstBold>Registrert: <EnkeltDato dato={registrertDato} visTidspunkt /></Nav.UndertekstBold>
            <Nav.UndertekstBold>Status: {status}</Nav.UndertekstBold>
          </div>
        </Nav.Panel>
      </Link>
    </div>
  );
}

SokListeEnkeltlinje.propTypes = {
  sak: MPT.SokListeEnkeltlinje.isRequired,
};

SokListeEnkeltlinje.defaultProps = {

};

export default SokListeEnkeltlinje;
