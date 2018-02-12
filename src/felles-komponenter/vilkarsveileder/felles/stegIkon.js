import React from 'react';
import PT from 'prop-types';
import classnames from 'classnames';

import { FANE_STATUS } from '../stegLogikk/typer';

import * as Ikon from '../../../resources/images';

import './stegIkon.css';

const StegIkon = props => {
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

  const {
    id, aktivtSteg, status, onClick, tilgjengelig,
  } = props;

  const erTilgjengelig = status !== FANE_STATUS.UBEHANDLET;
  const ikon = id === 'VEDTAK' ? IKONER.VEDTAK[status] : IKONER.STEG[status];

  const className = classnames(
    'stegIkon',
    (!erTilgjengelig ? 'stegIkon--utilgjengelig' : ''),
    (aktivtSteg && 'stegIkon--aktiv')
  );

  return (
    <li>
      <button
        className={className}
        onClick={onClick}
        style={{ backgroundImage: `url(${ikon})` }}
        aria-disabled={!tilgjengelig}
      />
    </li>
  );
};

StegIkon.propTypes = {
  id: PT.string.isRequired,
  status: PT.string.isRequired,
  tilgjengelig: PT.bool,
  onClick: PT.func.isRequired,
  aktivtSteg: PT.bool,
};

StegIkon.defaultProps = {
  tilgjengelig: false,
  aktivtSteg: false,
};

export default StegIkon;
