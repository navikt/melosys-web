import React, { KeyboardEvent, Fragment } from 'react';
import PT from 'prop-types';
import { KTObject } from 'melosys-kodeverk';

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

const hentFeilmeldingTittel = (kontrollKode: string) => {
  switch (kontrollKode) {
    case MKV.Koder.begrunnelser.kontroll_begrunnelser.MANGLENDE_BOSTEDSADRESSE:
    case MKV.Koder.begrunnelser.kontroll_begrunnelser.MANGLENDE_OPPL_ARBEIDSSTED:
    case MKV.Koder.begrunnelser.kontroll_begrunnelser.MANGLENDE_OPPL_ANDRE_ARBEIDSFORHOLD_NO:
    case MKV.Koder.begrunnelser.kontroll_begrunnelser.MANGLENDE_OPPL_ANDRE_ARBEIDSFORHOLD_UTL:
      return 'Manglende utfylling';
    default:
      return 'Feil ved kontroll';
  }
};

const hentFeilmelding = (valideringKode: string) => {
  let feilmelding = feilmeldingMap.get(valideringKode);

  if (!feilmelding) {
    const valideringKodeObjekt: KTObject = KV.kodeTilObjekt(valideringKode, MKV.KTObjects.begrunnelser.kontroll_begrunnelser);
    if (valideringKodeObjekt) {
      feilmelding = {
        tittel: hentFeilmeldingTittel(valideringKodeObjekt.kode),
        innhold: valideringKodeObjekt.term || '',
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

export const Valideringsfeil = ({
  validering,
}: {
  validering: Validering
}) => {
  const felter = validering.felter.map(felt => {
    const { panel, panelEntryNr, felt: feltNavn } = Utils.mapping.mapBehandlingsgrunnlagpathTilGUI(felt);
    const key = `${panel}${panelEntryNr}${feltNavn}`;
    const tekst = panel && feltNavn ? `${panel} - ${feltNavn}` : null;

    if (!tekst) return null;

    return (
      <li key={key}>{tekst}</li>
    );
  }).filter(felt => felt);

  return (
    <Fragment>
      <Validering valideringKode={validering.kode} />
      {
        felter.length > 0 &&
        <Fragment>
          Sjekk følgende felt(er):
          <ul>
            { felter }
          </ul>
        </Fragment>
      }
    </Fragment>
  );
};

Valideringsfeil.propTypes = {
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

  const feilmeldingerInnhold = feilmeldinger.map(feilmelding => <ModalBody tittel={feilmelding.tittel} innhold={feilmelding.innhold} key={Utils._uuid()} />);

  const valideringerInnhold = valideringer.map(validering => <Valideringsfeil validering={validering} key={validering.kode} />);

  const innhold = valideringer.length > 0 ? valideringerInnhold : feilmeldingerInnhold;

  return (
    <Nav.Modal
      className="dialogboksValidering"
      isOpen
      contentLabel="Valideringsmeldinger"
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
