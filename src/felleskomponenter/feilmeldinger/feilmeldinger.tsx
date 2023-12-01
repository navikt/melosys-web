import classNames from "classnames";
import { useSelector } from "react-redux";

import MKV from "../../melosyskodeverk";
import * as Nav from "../../navFrontend";
import * as KV from "../../kodeverk";

import * as Utils from "../../utils";
import "./feilmelding.css";
import { feiletResponsSelectors } from "../../ducks/feiletRespons";
import { kontrollSelectors } from "../../ducks/kontroll";

type feilmeldingerProps = {
  className?: string;
  exclude?: string[];
};

export default ({ className, exclude }: feilmeldingerProps) => {
  const feilmeldinger = useSelector(feiletResponsSelectors.FeilmeldingerSelector);
  const kontrollfeil = useSelector(kontrollSelectors.KontrollfeilSelector);

  if (Utils._isEmpty(feilmeldinger) && Utils._isEmpty(kontrollfeil)) {
    return null;
  }

  const renderFiltrerteFeilmeldinger = () => {
    if (typeof feilmeldinger === "string") {
      return feilmeldinger;
    }

    const filtrerteFeilmeldinger = kontrollfeil
      .concat(feilmeldinger)
      .filter((value) => !exclude?.includes(value.kode))
      .filter((value) => value.type !== "ADVARSEL");

    if (filtrerteFeilmeldinger.length === 0) {
      return null;
    }

    if (filtrerteFeilmeldinger.length === 1) {
      return KV.kodeTilTerm(filtrerteFeilmeldinger[0].kode, MKV.KTObjects.begrunnelser.kontroll_begrunnelser);
    }
    return (
      <ul className="feilkoder__liste">
        {filtrerteFeilmeldinger.map((feil) => (
          <li key={feil.kode}>{KV.kodeTilTerm(feil.kode, MKV.KTObjects.begrunnelser.kontroll_begrunnelser)}</li>
        ))}
      </ul>
    );
  };

  const renderAdvarsler = () => {
    if (typeof feilmeldinger === "string") {
      return feilmeldinger;
    }

    const advarsler = kontrollfeil
      .concat(feilmeldinger)
      .filter((value) => !exclude?.includes(value.kode))
      .filter((value) => value.type === "ADVARSEL");

    if (advarsler.length === 0) {
      return null;
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
  const filtrerteFeilmeldingerContent = renderFiltrerteFeilmeldinger();
  const advarslerContent = renderAdvarsler();

  if (!filtrerteFeilmeldingerContent && !advarslerContent) {
    return null;
  }

  return (
    <div className={classNameFeilmeldinger}>
      {filtrerteFeilmeldingerContent && (
        <Nav.AlertStripeFeil className="varselstripe">{filtrerteFeilmeldingerContent}</Nav.AlertStripeFeil>
      )}
      {advarslerContent && (
        <Nav.AlertStripeAdvarsel className="advarsler-container">{advarslerContent}</Nav.AlertStripeAdvarsel>
      )}
    </div>
  );
};
