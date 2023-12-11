import { useEffect, useState } from "react";
import { AlertStripeType } from "nav-frontend-alertstriper";
import classNames from "classnames";

import MKV from "../../melosyskodeverk";
import * as Ikoner from "../../resources/images";
import * as KV from "../../kodeverk";
import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";

import { Feilkode } from "../../@types";
import "./alertmeldinger.css";

type alertmeldingerProps = {
  meldinger: Feilkode[] | string;
  className?: string;
};

export const Innsynsmelding = ({ className = "" }) => (
  <Nav.AlertStripeInfo className={`innsynsmelding ${className}`}>Innsynsmodus</Nav.AlertStripeInfo>
);

export const VirksomhetMelding = () => (
  <Nav.AlertStripeInfo className="virksomhetMelding">Behandlingen er journalført på virksomhet</Nav.AlertStripeInfo>
);

export const IngenFlytMelding = () => (
  <Nav.AlertStripeAdvarsel className="ingenFlytMelding">
    <b>Du kan ikke gå videre, men:</b>
    <ul className="listePadding">
      <li>
        du kan bruke &quot;Send brev&quot;-fanen for å sende brev og vedtak, og &quot;Opprett ny BUC&quot;-fanen for å
        sende SED
      </li>
      <li>du må avslutte behandlingen og angi resultatet i behandlingsmenyen</li>
      <li>periode i MEDL og eventuelt avgiftssystemet må registreres manuelt</li>
    </ul>
  </Nav.AlertStripeAdvarsel>
);

export const NyVurderingMelding = () => (
  <Nav.AlertStripeAdvarsel className="nyVurderingMelding">
    <Nav.Typo.Normaltekst className="nyVurderingMelding__overskrift">Ny behandling av sak</Nav.Typo.Normaltekst>
    <Nav.Typo.Normaltekst>
      Du har startet en ny behandling av en sak der tidligere behandling er avsluttet. Sjekk sakens opplysninger og
      vurder videre behandling.
    </Nav.Typo.Normaltekst>
  </Nav.AlertStripeAdvarsel>
);

interface StandardMeldingOverstProps {
  type: AlertStripeType;
  actionEtterSynlighet: () => void;
  melding: string;
}

export const StandardMeldingOverst = ({ type, actionEtterSynlighet, melding }: StandardMeldingOverstProps) => {
  const [viserMelding, setViserMelding] = useState(true);
  const VARIGHET_MELDING = 3000;

  useEffect(() => {
    const timer = setTimeout(() => {
      actionsEtterSynlighet();
    }, VARIGHET_MELDING);
    return () => clearTimeout(timer);
  }, []);

  const actionsEtterSynlighet = () => {
    if (viserMelding) {
      setViserMelding(false);
      actionEtterSynlighet();
    }
  };

  return viserMelding ? (
    <div className="standardMeldingOverst">
      <Nav.AlertStripe type={type}>
        <div className="fullBredde">
          {melding}
          <Ikoner.Remove onClick={() => actionsEtterSynlighet()} />
        </div>
      </Nav.AlertStripe>
    </div>
  ) : null;
};

export const Alertmeldinger = ({ meldinger, className }: alertmeldingerProps) => {
  if (Utils._isEmpty(meldinger)) {
    return null;
  }

  const renderInnhold = () => {
    if (typeof meldinger === "string") {
      return meldinger;
    }

    if (meldinger.length === 1) {
      return KV.kodeTilTerm(meldinger[0].kode, MKV.KTObjects.begrunnelser.kontroll_begrunnelser);
    }

    if (meldinger.length === 0) {
      return null;
    }

    return (
      <ul className="feilkoder__liste">
        {meldinger.map((feil) => (
          <li key={feil.kode}>{KV.kodeTilTerm(feil.kode, MKV.KTObjects.begrunnelser.kontroll_begrunnelser)}</li>
        ))}
      </ul>
    );
  };

  const classNameAlertmeldinger = classNames("alertmeldinger", className);
  const innhold = renderInnhold();
  if (!innhold) {
    return null;
  }
  return (
    <div className={classNameAlertmeldinger}>
      <Nav.AlertStripeAdvarsel className="varselstripe">{innhold}</Nav.AlertStripeAdvarsel>
    </div>
  );
};
