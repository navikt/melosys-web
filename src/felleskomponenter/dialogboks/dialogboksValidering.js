import React, { Fragment } from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as KV from '../../kodeverk';
import * as Utils from '../../utils';

import MKV from '../../melosyskodeverk';

import './dialogboksValidering.css';

const feilmeldingMap = {
  [MKV.Koder.begrunnelser.kontroll_begrunnelser.OVERLAPPENDE_MEDL_PERIODER]: {
    tittel: 'Overlappende periode',
    innhold: 'Du kan ikke fatte vedtak fordi det ligger en overlappende periode i MEDL. Du må endre søknadsperioden eller perioden som er registrert i MEDL, slik at de ikke overlapper.',
  },
  [MKV.Koder.begrunnelser.kontroll_begrunnelser.PERIODEN_OVER_24_MD]: {
    tittel: 'Periode over 24 måneder',
    innhold: 'Du kan ikke fatte vedtak etter artikkel 12.',
  },
};

const hentFeilmelding = valideringKode => {
  let feilmelding = feilmeldingMap[valideringKode];

  if (!feilmelding) {
    const valideringKodeObjekt = KV.kodeTilObjekt(valideringKode, MKV.KTObjects.begrunnelser.kontroll_begrunnelser);
    if (valideringKodeObjekt) {
      feilmelding = {
        tittel: 'Feil ved kontroll',
        innhold: valideringKodeObjekt.term,
      };
    }
  }

  if (!feilmelding) {
    return {
      tittel: 'Ukjent feil',
      innhold: '',
    };
  }

  return feilmelding;
};

export const ModalBody = ({ tittel, innhold }) => (
  <div className="validering">
    <Nav.typo.Element className="valideringKode">{tittel}</Nav.typo.Element>
    <Nav.Tekstomrade>{innhold}</Nav.Tekstomrade>
  </div>
);

ModalBody.propTypes = {
  tittel: PT.string.isRequired,
  innhold: PT.string.isRequired,
};

export const Validering = ({ valideringKode }) => {
  const { tittel, innhold } = hentFeilmelding(valideringKode);

  return (
    <ModalBody tittel={tittel} innhold={innhold} />
  );
};

Validering.propTypes = {
  valideringKode: PT.string.isRequired,
};

export const Feilmelding = ({ feilmelding: { tittel, innhold } }) => (
  <ModalBody tittel={tittel} innhold={innhold} />
);

Feilmelding.propTypes = {
  feilmelding: PT.shape({
    tittel: PT.string,
    innhold: PT.string,
  }).isRequired,
};

export const VedtakValideringsfeil = ({
  feil,
}) => (
  <Fragment>
    <Validering valideringKode={feil.kode} />
    {
      feil.felter.length > 0 && 'Sjekk følgende felt(er):'
    }
    <ul>
      {
        feil.felter.map(felt => {
          const { panel, panelEntryNr, felt: feltNavn } = Utils.mapping.mapBehandlingsgrunnlagpathTilGUI(felt);
          const key = `${panel}${panelEntryNr}${feltNavn}`;
          const tekst = panel || feltNavn ? `${panel} - ${feltNavn}` : null;

          if (!tekst) return null;

          return (
            <li key={key}>{tekst}</li>
          );
        })
      }
    </ul>
  </Fragment>
);

VedtakValideringsfeil.propTypes = {
  feil: PT.shape({
    kode: PT.string.isRequired,
    felter: PT.arrayOf(PT.string).isRequired,
  }).isRequired,
};

export const DialogboksValidering = ({
  avbryt,
  ariaHideApp,
  vedtakValideringsfeil,
  journalforingValideringerFeilmeldinger,
}) => {
  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      avbryt();
    }
  };

  const journalforingValideringInnhold = journalforingValideringerFeilmeldinger.map(feilmelding => <Feilmelding feilmelding={feilmelding} key={Utils._uuid()} />);

  const vedtakValideringInnhold = vedtakValideringsfeil.map(feil => <VedtakValideringsfeil feil={feil} key={feil.kode} />);

  const innhold = Utils._isEmpty(journalforingValideringerFeilmeldinger)
    ? vedtakValideringInnhold
    : journalforingValideringInnhold;

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
      { innhold }
    </Nav.Modal>
  );
};

DialogboksValidering.propTypes = {
  avbryt: PT.func.isRequired,
  ariaHideApp: PT.bool,
  vedtakValideringsfeil: PT.arrayOf(PT.shape({
    kode: PT.string.isRequired,
    felter: PT.arrayOf(PT.string).isRequired,
  })),
  journalforingValideringerFeilmeldinger: PT.arrayOf(PT.shape({
    tittel: PT.string.isRequired,
    innhold: PT.string.isRequired,
  })),
};

DialogboksValidering.defaultProps = {
  ariaHideApp: true,
  vedtakValideringsfeil: [],
  journalforingValideringerFeilmeldinger: [],
};

export default DialogboksValidering;
