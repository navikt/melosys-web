import React from 'react';
import PT from 'prop-types';
import classnames from 'classnames';

import { FANE_STATUS } from '../stegMotor/typer';

import * as Ikon from '../../../resources/images';

import './stegIkon.css';

const ikonVelger = (id, status, aktivtSteg) => {
  const IKONER = {
    STEG: {
      UBEHANDLET: Ikon.Ubehandlet,
      OK: Ikon.Ferdig,
      ADVARSEL: Ikon.Varsel,
      FEIL: Ikon.Feil,
    },
    VEDTAK: {
      UBEHANDLET: Ikon.VedakUbehandlet,
      OK: Ikon.VedtakGodkjent,
      ADVARSEL: Ikon.VedtakAvslatt,
      FEIL: Ikon.VedtakAvslatt,
    },
  };

  if (id === 'VEDTAK' || id === 'AVSLAG_12_X_OG_16') {
    return IKONER.VEDTAK[status];
  }

  if (aktivtSteg) {
    return Ikon.Ubehandlet;
  }

  return IKONER.STEG[status];
};

const StegIkon = props => {
  const {
    id, aktivtSteg, status, tittel, onClick, tilgjengelig,
  } = props;

  const erTilgjengelig = status !== FANE_STATUS.UBEHANDLET;
  const ikon = ikonVelger(id, status, aktivtSteg);

  const cl = classnames(
    'stegIkon',
    (!erTilgjengelig ? 'stegIkon-utilgjengelig' : '')
  );

  const knappKlasser = classnames({
    stegIkon__enkeltSteg: id !== 'VEDTAK',
    stegIkon__vedtak: id === 'VEDTAK',
  });

  return (
    <li className={cl}>
      <button onClick={onClick} className="stegIkon__knapp">
        <div
          className={knappKlasser}
          style={{ backgroundImage: `url(${ikon})` }}
          aria-disabled={!tilgjengelig}
        />
        <div className="stegIkon__tittel">{tittel}</div>
      </button>
    </li>
  );
};

StegIkon.propTypes = {
  id: PT.string.isRequired,
  status: PT.string.isRequired,
  tittel: PT.string.isRequired,
  tilgjengelig: PT.bool,
  onClick: PT.func.isRequired,
  aktivtSteg: PT.bool,
};

StegIkon.defaultProps = {
  tilgjengelig: false,
  aktivtSteg: false,
};

export default StegIkon;
