import { Suspense, useContext, useState } from "react";
import usePromise from "react-promise-suspense";
import PT from "prop-types";
import classNames from "classnames";
import * as Sentry from "@sentry/react";
import * as Nav from "../../../navFrontend";
import Knapperad from "../../knapperad";

import "./dialogboksOppfrisk.css";
import { StandardMeldingOverst } from "../../alertmeldinger";
import { Spinner } from "../../spinner";
import { FellesHandlersContext } from "../../../contexts";

const OppfriskBekreft = ({ bekreft, avbryt }) => (
  <div>
    <Nav.Heading size="small">Vil du oppdatere registeropplysninger?</Nav.Heading>
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
    <StandardMeldingOverst variant="success" actionEtterSynlighet={lukk} melding="Registeropplysningene er oppdatert" />
  );
};

Oppfrisk.propTypes = {
  lukk: PT.func.isRequired,
  oppfrisk: PT.func.isRequired,
};

const OppfriskFeilmelding = ({ avbryt, resetErrorBoundary }) => (
  <StandardMeldingOverst
    variant="error"
    actionEtterSynlighet={() => {
      avbryt();
      resetErrorBoundary();
    }}
    melding="Oppdateringen feilet!"
  />
);

OppfriskFeilmelding.propTypes = {
  resetErrorBoundary: PT.func.isRequired,
  avbryt: PT.func.isRequired,
};

// Returnerer OppfriskVenter mens behandlingen oppfriskes og OppfriskFeilmelding dersom oppfrisk() returnerer != 2xx
const OppfriskBehandling = ({ oppfrisk, lukk, tilForsiden, avbryt }) => {
  return (
    <Sentry.ErrorBoundary
      fallback={({ resetError }) => <OppfriskFeilmelding resetErrorBoundary={resetError} avbryt={avbryt} />}
    >
      <Suspense fallback={<OppfriskVenter tilForsiden={tilForsiden} />}>
        <Oppfrisk oppfrisk={oppfrisk} lukk={lukk} />
      </Suspense>
    </Sentry.ErrorBoundary>
  );
};

OppfriskBehandling.propTypes = {
  lukk: PT.func.isRequired,
  tilForsiden: PT.func.isRequired,
  oppfrisk: PT.func.isRequired,
  avbryt: PT.func.isRequired,
};

const BekreftEllerOppfrisk = ({ bekreftet, settBekreftet, oppfrisk, avbryt, lukk, tilForsiden }) =>
  bekreftet ? (
    <OppfriskBehandling oppfrisk={oppfrisk} lukk={lukk} tilForsiden={tilForsiden} avbryt={avbryt} />
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
    <Nav.Heading size="small">Kan ikke oppdatere registeropplysninger</Nav.Heading>
    <Nav.Alert variant="warning">
      Registeropplysningene i en annen behandling er i ferd med å bli oppdatert. Vent til den behandlingen er oppdatert
      før du starter å oppdatere denne.
    </Nav.Alert>
    <div className="knapperadcontainer">
      <Nav.Button variant="primary" onClick={avbryt} size="medium">
        Lukk
      </Nav.Button>
    </div>
  </div>
);

AnnenBehandlingOppfriskes.propTypes = {
  avbryt: PT.func.isRequired,
};

const DialogboksOppfriskBehandling = ({ avbryt, lukk, tilForsiden, oppfrisk, bekreftetFraStart }) => {
  const { behandlingOppfriskes, annenBehandlingOppfriskes } = useContext(FellesHandlersContext);
  const [bekreftet, setBekreftet] = useState(bekreftetFraStart || behandlingOppfriskes);

  return (
    <Nav.Modal
      open
      className={classNames("dialogboksOppfriskBehandling", { skjulBakgrunn: bekreftet })}
      onClose={tilForsiden}
      header={{ heading: "", closeButton: false }}
    >
      <Nav.Modal.Body>
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
      </Nav.Modal.Body>
    </Nav.Modal>
  );
};

DialogboksOppfriskBehandling.propTypes = {
  oppfrisk: PT.func.isRequired,
  avbryt: PT.func.isRequired,
  lukk: PT.func.isRequired,
  tilForsiden: PT.func.isRequired,
  bekreftetFraStart: PT.bool,
};

DialogboksOppfriskBehandling.defaultProps = {
  bekreftetFraStart: false,
};

export default DialogboksOppfriskBehandling;
