import React, { Suspense, useState } from 'react';
import usePromise from 'react-promise-suspense';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import ErrorBoundary from '../ErrorBoundary';
import Knapperad from '../knapperad';

import './dialogboksOppfrisk.css';

const OppfriskBekreft = ({ bekreft, avbryt }) => (
  <div>
    <Nav.typo.Systemtittel>Vil du oppdatere registeropplysninger?</Nav.typo.Systemtittel>
    <Nav.typo.Normaltekst>Oppdatering av registeropplysning kan ta noe tid. Du kan velge om du vil gå tilbake til forsiden for å behandle en annen oppgave imens.</Nav.typo.Normaltekst>
    <div className="knapperadcontainer">
      <Knapperad
        bekreft={bekreft}
        bekreftTekst="Fortsett oppdatering"
        avbryt={avbryt}
        avbrytTekst="Avbryt oppdatering"
        redigerbart
      />
    </div>
  </div>
);

OppfriskBekreft.propTypes = {
  bekreft: PT.func.isRequired,
  avbryt: PT.func.isRequired,
};

const OppfriskVenter = ({ tilForsiden }) => (
  <div>
    <Nav.NavFrontendSpinner className="spinner" />
    <Nav.typo.Systemtittel className="overskrift">Oppdaterer registeropplysninger</Nav.typo.Systemtittel>
    <Nav.typo.Normaltekst className="tekst">Vent mens registeropplysningene hentes på nytt fra TPS, Aa-register, Medl etc.</Nav.typo.Normaltekst>
    <div className="knapperadcontainer">
      <Nav.Knapp onClick={tilForsiden}>Til forsiden</Nav.Knapp>
    </div>
  </div>
);

OppfriskVenter.propTypes = {
  tilForsiden: PT.func.isRequired,
};

const Oppfrisk = ({ oppfrisk, lukk }) => {
  const CACHE_LIFESPAN_MS = 1000;

  // Blokkerer visning av denne komponenten frem til oppfrisk() svarer. Resultatet blir cachet.
  usePromise(async () => {
    await oppfrisk();
  }, [], CACHE_LIFESPAN_MS);

  return (
    <div>
      <Nav.typo.Systemtittel>Registeropplysninger har blitt oppdatert</Nav.typo.Systemtittel>
      <Nav.AlertStripe type="suksess">Registeropplysninger i denne behandlingen har blitt oppdatert. Du kan nå fortsette å behandle denne saken.</Nav.AlertStripe>
      <div className="knapperadcontainer">
        <Nav.Knapp onClick={lukk}>Lukk</Nav.Knapp>
      </div>
    </div>
  );
};

Oppfrisk.propTypes = {
  lukk: PT.func.isRequired,
  oppfrisk: PT.func.isRequired,
};

const OppfriskFeilmelding = ({ tilForsiden }) => (
  <div>
    <Nav.typo.Systemtittel>Noe gikk galt</Nav.typo.Systemtittel>
    <Nav.AlertStripe type="feil">Noe gikk galt ved oppdatering av registeropplysninger</Nav.AlertStripe>
    <div className="knapperadcontainer">
      <Nav.Knapp onClick={tilForsiden}>Lukk</Nav.Knapp>
    </div>
  </div>
);

OppfriskFeilmelding.propTypes = {
  tilForsiden: PT.func.isRequired,
};

// Returnerer OppfriskVenter mens behandlingen oppfriskes og OppfriskFeilmelding dersom oppfrisk() returnerer != 2xx
const OppfriskBehandling = ({ oppfrisk, lukk, tilForsiden }) => (
  <ErrorBoundary errorComponent={<OppfriskFeilmelding tilForsiden={tilForsiden} />}>
    <Suspense fallback={<OppfriskVenter tilForsiden={tilForsiden} />}>
      <Oppfrisk oppfrisk={oppfrisk} lukk={lukk} />
    </Suspense>
  </ErrorBoundary>
);

OppfriskBehandling.propTypes = {
  lukk: PT.func.isRequired,
  tilForsiden: PT.func.isRequired,
  oppfrisk: PT.func.isRequired,
};

const BekreftEllerOppfrisk = ({
  bekreftet, settBekreftet, oppfrisk, avbryt, tilForsiden,
}) => (
  bekreftet
    ? <OppfriskBehandling oppfrisk={oppfrisk} lukk={avbryt} tilForsiden={tilForsiden} />
    : <OppfriskBekreft bekreft={settBekreftet} avbryt={avbryt} />
);

BekreftEllerOppfrisk.propTypes = {
  bekreftet: PT.bool.isRequired,
  settBekreftet: PT.func.isRequired,
  oppfrisk: PT.func.isRequired,
  avbryt: PT.func.isRequired,
  tilForsiden: PT.func.isRequired,
};

const AnnenBehandlingOppfriskes = ({ lukk }) => (
  <div>
    <Nav.typo.Systemtittel>Kan ikke oppdatere registeropplysninger</Nav.typo.Systemtittel>
    <Nav.AlertStripe type="advarsel">
      Registeropplysningene i en annen behandling er i ferd med å bli oppdatert. Registeropplysningene i denne behandlingen kan ikke bli oppdatert enda.
    </Nav.AlertStripe>
    <div className="knapperadcontainer">
      <Nav.Knapp onClick={lukk}>Lukk</Nav.Knapp>
    </div>
  </div>
);

AnnenBehandlingOppfriskes.propTypes = {
  lukk: PT.func.isRequired,
};

const DialogboksOppfriskBehandling = ({
  avbryt, tilForsiden, oppfrisk, behandlingOppfriskes, annenBehandlingOppfriskes,
}) => {
  const [bekreftet, setBekreftet] = useState(behandlingOppfriskes);

  return (
    <Nav.Modal
      isOpen
      className="dialogboksOppfriskBehandling"
      contentLabel="Oppfrisk behandling"
      onRequestClose={tilForsiden}
      closeButton={false}
      shouldCloseOnOverlayClick={false}
    >
      {
        annenBehandlingOppfriskes ?
          <AnnenBehandlingOppfriskes lukk={avbryt} /> :
          <BekreftEllerOppfrisk
            tilForsiden={tilForsiden}
            settBekreftet={() => setBekreftet(true)}
            oppfrisk={oppfrisk}
            avbryt={avbryt}
            bekreftet={bekreftet} />
      }
    </Nav.Modal>
  );
};

DialogboksOppfriskBehandling.propTypes = {
  oppfrisk: PT.func.isRequired,
  avbryt: PT.func.isRequired,
  tilForsiden: PT.func.isRequired,
  behandlingOppfriskes: PT.bool.isRequired,
  annenBehandlingOppfriskes: PT.bool.isRequired,
};

Nav.Modal.setAppElement('#root');

export default DialogboksOppfriskBehandling;
