import classNames from "classnames";
import { useSelector } from "react-redux";

import MKV from "../../melosyskodeverk";
import * as Nav from "../../navFrontend";
import * as KV from "../../kodeverk";

import * as Utils from "../../utils";
import "./feilmelding.css";
import { feiletResponsSelectors } from "../../ducks/feiletRespons";
import { kontrollSelectors } from "../../ducks/kontroll";

interface FeilmeldingerProps {
  className?: string;
}

export default function ({ className }: FeilmeldingerProps) {
  const exceptionFeilmeldinger = useSelector(feiletResponsSelectors.FeilmeldingerSelector);
  const kontrollFeil = useSelector(kontrollSelectors.KontrollFeilSelector);
  const kontrollAdvarsler = useSelector(kontrollSelectors.KontrollAdvarslerSelector);

  if (Utils._isEmpty(exceptionFeilmeldinger) && Utils._isEmpty(kontrollFeil) && Utils._isEmpty(kontrollAdvarsler)) {
    return null;
  }

  const renderFeilmeldinger = () => {
    if (typeof exceptionFeilmeldinger === "string") {
      return `Teknisk feil: ${exceptionFeilmeldinger}`;
    }

    const feilmeldinger = kontrollFeil.concat(exceptionFeilmeldinger);

    if (feilmeldinger.length === 0) {
      return null;
    }

    if (feilmeldinger.length === 1) {
      return KV.kodeTilTerm(feilmeldinger[0].kode, MKV.KTObjects.begrunnelser.kontroll_begrunnelser);
    }
    return (
      <ul className="feilkoder__liste">
        {feilmeldinger.map((feil) => (
          <li key={feil.kode}>{KV.kodeTilTerm(feil.kode, MKV.KTObjects.begrunnelser.kontroll_begrunnelser)}</li>
        ))}
      </ul>
    );
  };

  const renderAdvarsler = () => {
    const advarsler = kontrollAdvarsler;

    if (advarsler.length === 0) {
      return null;
    }

    if (advarsler.length === 1) {
      return KV.kodeTilTerm(advarsler[0].kode, MKV.KTObjects.begrunnelser.kontroll_begrunnelser);
    }

    return (
      <ul className="advarsler__liste">
        {advarsler.map((adv) => (
          <li key={adv.kode}>{KV.kodeTilTerm(adv.kode, MKV.KTObjects.begrunnelser.kontroll_begrunnelser)}</li>
        ))}
      </ul>
    );
  };

  const classNameFeilmeldinger = classNames("feilmelding", className);
  const feilmeldingerContent = renderFeilmeldinger();
  const advarslerContent = renderAdvarsler();

  if (!feilmeldingerContent && !advarslerContent) {
    return null;
  }

  return (
    <div className={classNameFeilmeldinger}>
      {feilmeldingerContent && (
        <Nav.Alert variant="error" className="varselstripe">
          {feilmeldingerContent}
        </Nav.Alert>
      )}
      {advarslerContent && (
        <Nav.Alert variant="warning" className="advarsler-container">
          {advarslerContent}
        </Nav.Alert>
      )}
    </div>
  );
}
