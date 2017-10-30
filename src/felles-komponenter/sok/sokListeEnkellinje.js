import React from 'react';
import { Link } from 'react-router-dom';

import * as MPT from '../../proptypes';
import * as Nav from '../../utils/navFrontend';
import * as Ikon from '../../resources/images/index';
import EnkeltDato from '../datoOmrade/enkeltDato';

import './sokListeEnkeltlinje.css';

function SokListeEnkeltlinje({ sak }) {
  const { fnr, sammensattNavn, mottatt, status, periode } = sak;
  const link = `/saksbehandling/${fnr}`;
  const ikon = sak.kjoenn === 'M' ? Ikon.Mann : Ikon.Kvinne;

  const periodeElement = periode ? <Nav.UndertekstBold>Periode: <EnkeltDato dato={periode.fom} /> - <EnkeltDato dato={periode.tom} /></Nav.UndertekstBold> : null;

  return (
    <div className="sokliste__enkeltlinje">
      <Link to={link} className="enkeltlinje__link">
        <Nav.Panel className="enkeltlinje__panel">
          <div className="enkeltlinje__kjoenn">
            <img src={ikon} alt="Ikon for kjønn" className="kjonn__ikon" />
          </div>
          <div className="enkeltlinje__info">
            <Nav.Undertittel>{sammensattNavn}</Nav.Undertittel>
            <Nav.Element>Fødselsnr: {fnr}</Nav.Element>
            <Nav.UndertekstBold>Mottatt: <EnkeltDato dato={mottatt} /></Nav.UndertekstBold>
            {periodeElement}
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
