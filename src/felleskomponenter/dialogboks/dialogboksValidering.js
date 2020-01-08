import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';

import MKV from '../../melosyskodeverk';

import './dialogboksValidering.css';

const feilmeldingMap = {
  [MKV.Koder.begrunnelser.unntak_periode_begrunnelser.OVERLAPPENDE_MEDL_PERIODER]: {
    tittel: 'Overlappende periode',
    innhold: 'Du kan ikke fatte vedtak på grunn av overlappende periode i MEDL.\n Rediger gammel periode i Gosys og fatt vedtak etterpå.',
  },
  [MKV.Koder.begrunnelser.unntak_periode_begrunnelser.PERIODEN_OVER_24_MD]: {
    tittel: 'Periode over 24 måneder',
    innhold: 'Du kan ikke fatte vedtak på grunn av at perioden er over 24 måneder.',
  },
};

const hentFeilmelding = valideringKode => {
  const feilmelding = feilmeldingMap[valideringKode];

  if (!feilmelding) {
    return {
      tittel: 'Ukjent feil',
      innhold: '',
    };
  }

  return feilmelding;
};

export const DialogboksValidering = ({
  avbryt,
  ariaHideApp,
  valideringer,
}) => {
  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      avbryt();
    }
  };

  return (
    <Nav.Modal
      className="dialogboksValidering"
      isOpen
      contentLabel="Valideringer for fattet vedtak"
      onRequestClose={avbryt}
      closeButton={false}
      shouldCloseOnOverlayClick
      ariaHideApp={ariaHideApp}
    >
      <span
        id="closeButton"
        tabIndex={0}
        role="button"
        onClick={avbryt}
        onKeyPress={handleKeyPress}
        onKeyUp={handleKeyPress}
      >
        &times;
      </span>
      {
        valideringer.map(valideringKode => {
          const { tittel, innhold } = hentFeilmelding(valideringKode);

          return (
            <div key={valideringKode} className="validering">
              <Nav.typo.Element className="valideringKode">{tittel}</Nav.typo.Element>
              <Nav.Tekstomrade>{innhold}</Nav.Tekstomrade>
            </div>
          );
        })
      }
    </Nav.Modal>
  );
};

DialogboksValidering.propTypes = {
  avbryt: PT.func.isRequired,
  ariaHideApp: PT.bool,
  valideringer: PT.arrayOf(PT.string).isRequired,
};

DialogboksValidering.defaultProps = {
  ariaHideApp: true,
};

export default DialogboksValidering;
