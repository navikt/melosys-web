import { AlertStripeType } from "nav-frontend-alertstriper";
import React, { useEffect, useState } from "react";
import classNames from "classnames";
import * as Nav from "../../navFrontend";
import "./alertmeldinger.css";
import * as Ikoner from "../../resources/images";
import * as Utils from "../../utils";
import * as KV from "../../kodeverk";
import MKV from "../../melosyskodeverk";
import { Feilkode } from "../../@types";

type alertmeldingerProps = {
  meldinger: Feilkode[] | string;
  className?: string;
  exclude?: string;
};

export const VirksomhetMelding = () => (
  <Nav.AlertStripeInfo className="virksomhetMelding">Behandlingen er journalført på virksomhet</Nav.AlertStripeInfo>
);

export const TomFlytMelding = ({ visBuc = false }) => (
  <div className="tomFlytMelding">
    <Nav.AlertStripeAdvarsel className="tomFlytMelding">
      <b>Det finnes ikke en stegvelger for behandlingstemaet du har valgt, men:</b>
      <ul>
        {visBuc && (
          <li>
            du kan bruke &quot;Send brev&quot;-fanen for å sende brev og vedtak og &quot;Opprett ny BUC&quot;-fanen for
            å sende SED
          </li>
        )}
        {!visBuc && <li>du kan bruke &quot;Send brev&quot;-fanen for å sende brev og vedtak</li>}
        <li>du kan avslutte saken og angi resultatet i behandlingsmenyen</li>
      </ul>
    </Nav.AlertStripeAdvarsel>
  </div>
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

export const Alertmeldinger = ({ meldinger, className, exclude }: alertmeldingerProps) => {
  if (Utils._isEmpty(meldinger)) {
    return null;
  }

  const renderInnhold = () => {
    if (typeof meldinger === "string") {
      return meldinger;
    }

    const filtrerteAlertmeldinger = meldinger.filter((value) => value.kode !== exclude);

    if (filtrerteAlertmeldinger.length === 1) {
      return KV.kodeTilTerm(filtrerteAlertmeldinger[0].kode, MKV.KTObjects.begrunnelser.kontroll_begrunnelser);
    }
    return (
      <ul className="feilkoder__liste">
        {filtrerteAlertmeldinger.map((feil) => (
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
