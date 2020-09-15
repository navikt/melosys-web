import React, { KeyboardEvent, Fragment } from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as KV from '../../kodeverk';
import * as Utils from '../../utils';

import MKV from '../../melosyskodeverk';

import './dialogboksValidering.css';

interface Feilmelding {
  tittel: string,
  innhold: string,
}

const feilmeldingMap = new Map<string, Feilmelding>([
  [
    MKV.Koder.begrunnelser.kontroll_begrunnelser.OVERLAPPENDE_MEDL_PERIODER,
    {
      tittel: 'Overlappende periode',
      innhold: 'Du kan ikke fatte vedtak fordi det ligger en overlappende periode i MEDL. Du må endre søknadsperioden eller perioden som er registrert i MEDL, slik at de ikke overlapper.',
    },
  ],
  [
    MKV.Koder.begrunnelser.kontroll_begrunnelser.PERIODEN_OVER_24_MD,
    {
      tittel: 'Periode over 24 måneder',
      innhold: 'Du kan ikke fatte vedtak etter artikkel 12.',
    },
  ],
]);

const hentFeilmelding = (valideringKode: string) => {
  let feilmelding = feilmeldingMap.get(valideringKode);

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

export const ModalBody = ({ tittel, innhold }: Feilmelding) => (
  <div className="validering">
    <Nav.typo.Element className="valideringKode">{tittel}</Nav.typo.Element>
    <Nav.Tekstomrade>{innhold}</Nav.Tekstomrade>
  </div>
);

ModalBody.propTypes = {
  tittel: PT.string.isRequired,
  innhold: PT.string.isRequired,
};

interface ValideringProps {
  valideringKode: string,
}

export const Validering = ({ valideringKode }: ValideringProps) => {
  const { tittel, innhold } = hentFeilmelding(valideringKode);

  return (
    <ModalBody tittel={tittel} innhold={innhold} />
  );
};

Validering.propTypes = {
  valideringKode: PT.string.isRequired,
};

export const VedtakValideringsfeil = ({
  validering,
}: {
  validering: Validering
}) => (
  <Fragment>
    <Validering valideringKode={validering.kode} />
    {
      validering.felter.length > 0 && 'Sjekk følgende felt(er):'
    }
    <ul>
      {
        validering.felter.map(felt => {
          const { panel, panelEntryNr, felt: feltNavn } = Utils.mapping.mapBehandlingsgrunnlagpathTilGUI(felt);
          const key = `${panel}${panelEntryNr}${feltNavn}`;
          const tekst = panel && feltNavn ? `${panel} - ${feltNavn}` : null;

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
  validering: PT.shape({
    kode: PT.string.isRequired,
    felter: PT.arrayOf(PT.string).isRequired,
  }).isRequired,
};

interface Validering {
  kode: string,
  felter: string[],
}

interface DialogboksValideringProps {
  avbryt: () => void,
  valideringer: Validering[],
  feilmeldinger: Feilmelding[],
}

export const DialogboksValidering = ({
  avbryt,
  valideringer,
  feilmeldinger,
}: DialogboksValideringProps) => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      avbryt();
    }
  };

  const journalforingValideringInnhold = feilmeldinger.map(feilmelding => <ModalBody tittel={feilmelding.tittel} innhold={feilmelding.innhold} key={Utils._uuid()} />);

  const vedtakValideringInnhold = valideringer.map(validering => <VedtakValideringsfeil validering={validering} key={validering.kode} />);

  const innhold = Utils._isEmpty(feilmeldinger)
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
  valideringer: PT.arrayOf(PT.shape({
    kode: PT.string.isRequired,
    felter: PT.arrayOf(PT.string).isRequired,
  })),
  feilmeldinger: PT.arrayOf(PT.shape({
    tittel: PT.string,
    innhold: PT.string,
  })),
};

DialogboksValidering.defaultProps = {
  valideringer: [],
  feilmeldinger: [],
};

export default DialogboksValidering;
