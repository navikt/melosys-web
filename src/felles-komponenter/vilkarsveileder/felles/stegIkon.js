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
      AKTIV: Ikon.Aktivt,
      OK: Ikon.Ferdig,
      ADVARSEL: Ikon.Varsel,
      FEIL: Ikon.Feil,
    },
    VEDTAK: {
      UBEHANDLET: Ikon.VedakUbehandlet,
      AKTIV: Ikon.VedtakGodkjent,
      OK: Ikon.VedtakGodkjent,
      ADVARSEL: Ikon.VedtakAvslatt,
      FEIL: Ikon.VedtakAvslatt,
    },
  };

  const erTilgjengelig = props.status === FANE_STATUS.OK;
  const ikon = props.id === 'VEDTAK' ? IKONER.VEDTAK[props.status] : IKONER.STEG[props.status];
  const className = classnames('stegIkon', !erTilgjengelig ? 'stegIkon--utilgjengelig' : '');

  return (
    <li>
      <button
        className={className}
        onClick={props.onClick}
        style={{ backgroundImage: `url(${ikon})` }}
        aria-disabled={!props.tilgjengelig}
      />
    </li>
  );
};

StegIkon.propTypes = {
  id: PT.string.isRequired,
  status: PT.string.isRequired,
  tilgjengelig: PT.bool,
  onClick: PT.func.isRequired,
};

StegIkon.defaultProps = {
  tilgjengelig: false,
};

export default StegIkon;
