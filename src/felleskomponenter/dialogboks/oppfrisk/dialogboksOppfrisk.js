import React, { Suspense, useState } from "react";
import usePromise from "react-promise-suspense";
import PT from "prop-types";
import classNames from "classnames";

import * as Nav from "../../../navFrontend";
import ErrorBoundary from "../../ErrorBoundary";
import Knapperad from "../../knapperad";

import "./dialogboksOppfrisk.css";
import { StandardMeldingOverst } from "../../alertmeldinger";
import { Spinner } from "../../spinner";

const OppfriskBekreft = ({ bekreft, avbryt }) => (
  <div>
    <Nav.Typo.Systemtittel>Vil du oppdatere registeropplysninger?</Nav.Typo.Systemtittel>
    <Nav.Typo.Normaltekst>
      Oppdatering av registeropplysning kan ta noe tid. Du kan velge om du vil gå tilbake til forsiden for å behandle en
      annen oppgave imens.
    </Nav.Typo.Normaltekst>
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

const OppfriskVenter = () => <Spinner />;

const Oppfrisk = ({ oppfrisk, lukk }) => {
  const CACHE_LIFESPAN_MS = 1000;

  // Blokkerer visning av denne komponenten frem til oppfrisk() svarer. Resultatet blir cachet.
  usePromise(
    async () => {
      await oppfrisk();
    },
    [],
    CACHE_LIFESPAN_MS
  );

  return (
    <StandardMeldingOverst type="suksess" actionEtterSynlighet={lukk} melding="Registeropplysningene er oppdatert" />
  );
};

Oppfrisk.propTypes = {
  lukk: PT.func.isRequired,
  oppfrisk: PT.func.isRequired,
};

const OppfriskFeilmelding = ({ lukk, feilmelding, resetErrorBoundary }) => (
  <StandardMeldingOverst
    type="feil"
    actionEtterSynlighet={() => {
      lukk();
      resetErrorBoundary();
    }}
    melding={feilmelding ?? "Oppdateringen feilet!"}
  />
);

OppfriskFeilmelding.propTypes = {
  resetErrorBoundary: PT.func.isRequired,
  feilmelding: PT.string,
  lukk: PT.func.isRequired,
};
OppfriskFeilmelding.defaultProps = {
  feilmelding: undefined,
};

// Returnerer OppfriskVenter mens behandlingen oppfriskes og OppfriskFeilmelding dersom oppfrisk() returnerer != 2xx
const OppfriskBehandling = ({ oppfrisk, lukk, tilForsiden }) => {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <OppfriskFeilmelding
          resetErrorBoundary={resetErrorBoundary}
          lukk={lukk}
          feilmelding={error ? error.message : undefined}
        />
      )}
    >
      <Suspense fallback={<OppfriskVenter tilForsiden={tilForsiden} />}>
        <Oppfrisk oppfrisk={oppfrisk} lukk={lukk} />
      </Suspense>
    </ErrorBoundary>
  );
};

OppfriskBehandling.propTypes = {
  lukk: PT.func.isRequired,
  tilForsiden: PT.func.isRequired,
  oppfrisk: PT.func.isRequired,
};

const BekreftEllerOppfrisk = ({ bekreftet, settBekreftet, oppfrisk, avbryt, lukk, tilForsiden }) =>
  bekreftet ? (
    <OppfriskBehandling oppfrisk={oppfrisk} lukk={lukk} tilForsiden={tilForsiden} />
  ) : (
    <OppfriskBekreft bekreft={settBekreftet} avbryt={avbryt} />
  );

BekreftEllerOppfrisk.propTypes = {
  bekreftet: PT.bool.isRequired,
  settBekreftet: PT.func.isRequired,
  oppfrisk: PT.func.isRequired,
  avbryt: PT.func.isRequired,
  lukk: PT.func.isRequired,
  tilForsiden: PT.func.isRequired,
};

const AnnenBehandlingOppfriskes = ({ avbryt }) => (
  <div>
    <Nav.Typo.Systemtittel>Kan ikke oppdatere registeropplysninger</Nav.Typo.Systemtittel>
    <Nav.AlertStripe type="advarsel">
      Registeropplysningene i en annen behandling er i ferd med å bli oppdatert. Vent til den behandlingen er oppdatert
      før du starter å oppdatere denne.
    </Nav.AlertStripe>
    <div className="knapperadcontainer">
      <Nav.Knapp onClick={avbryt}>Lukk</Nav.Knapp>
    </div>
  </div>
);

AnnenBehandlingOppfriskes.propTypes = {
  avbryt: PT.func.isRequired,
};

const DialogboksOppfriskBehandling = ({
  avbryt,
  lukk,
  tilForsiden,
  oppfrisk,
  behandlingOppfriskes,
  annenBehandlingOppfriskes,
  ariaHideApp,
}) => {
  const [bekreftet, setBekreftet] = useState(behandlingOppfriskes);

  return (
    <Nav.Modal
      isOpen
      className={classNames("dialogboksOppfriskBehandling", { skjulBakgrunn: bekreftet })}
      contentLabel="Oppfrisk behandling"
      onRequestClose={tilForsiden}
      closeButton={false}
      shouldCloseOnOverlayClick={false}
      ariaHideApp={ariaHideApp}
    >
      {annenBehandlingOppfriskes ? (
        <AnnenBehandlingOppfriskes avbryt={avbryt} />
      ) : (
        <BekreftEllerOppfrisk
          tilForsiden={tilForsiden}
          settBekreftet={() => setBekreftet(true)}
          oppfrisk={oppfrisk}
          avbryt={avbryt}
          lukk={lukk}
          bekreftet={bekreftet}
        />
      )}
    </Nav.Modal>
  );
};

DialogboksOppfriskBehandling.propTypes = {
  oppfrisk: PT.func.isRequired,
  avbryt: PT.func.isRequired,
  lukk: PT.func.isRequired,
  tilForsiden: PT.func.isRequired,
  behandlingOppfriskes: PT.bool.isRequired,
  annenBehandlingOppfriskes: PT.bool.isRequired,
  ariaHideApp: PT.bool,
};

DialogboksOppfriskBehandling.defaultProps = {
  ariaHideApp: true,
};

export default DialogboksOppfriskBehandling;
