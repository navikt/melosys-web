import React from 'react';
import PT from 'prop-types';
import classnames from 'classnames';

import { FANE_STATUS, STEG } from '../stegMotor/typer';

import * as Ikon from '../../../resources/images';

import './stegIkon.css';

const erVedtakSteg = id => (
  id === STEG.VEDTAK ||
  id === STEG.ENDRET_PERIODE ||
  id === STEG.AVSLAG_12_X_OG_16 ||
  id === STEG.ARTIKKEL_16_VEDTAK ||
  id === STEG.ARTIKKEL_13_1_A_VEDTAK ||
  id === STEG.VIDERESEND ||
  id === STEG.ARTIKKEL_13_1_B_VEDTAK ||
  id === STEG.ARTIKKEL_13_1_B_UTPEK_LAND ||
  id === STEG.ARTIKKEL_13_2_A_VEDTAK
);

const ikonVelger = (id, status) => {
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

  if (erVedtakSteg(id)) {
    return IKONER.VEDTAK.OK;
  }

  return IKONER.STEG[status];
};

const StegIkon = props => {
  const {
    id, aktivtSteg, status, tittel, onClick, tilgjengelig,
  } = props;

  const erTilgjengelig = status !== FANE_STATUS.UBEHANDLET;
  const ikon = ikonVelger(id, status);

  const cl = classnames(
    'stegIkon',
    (!erTilgjengelig ? 'stegIkon-utilgjengelig' : ''),
    (aktivtSteg && 'stegIkon--aktiv'),
    (aktivtSteg && !erTilgjengelig && 'stegIkon--aktiv--utilgjengelig')
  );

  const knappKlasser = classnames({
    stegIkon__enkeltSteg: !erVedtakSteg(id),
    stegIkon__vedtak: erVedtakSteg(id),
  });

  /* eslint-disable react/no-danger */
  return (
    <li className={cl}>
      <button onClick={onClick} className="stegIkon__knapp">
        <div
          className={knappKlasser}
          style={{ backgroundImage: `url(${ikon})` }}
          aria-disabled={!tilgjengelig}
        />
        <div className="stegIkon__tittel" dangerouslySetInnerHTML={{ __html: tittel }} />
      </button>
    </li>
  );
  /* eslint-enable react/no-danger */
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
