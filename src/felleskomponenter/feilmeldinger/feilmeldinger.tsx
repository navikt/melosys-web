import classNames from "classnames";
import { useSelector } from "react-redux";

import MKV from "../../melosyskodeverk";
import * as Nav from "../../navFrontend";
import * as KV from "../../kodeverk";

import * as Utils from "../../utils";
import "./feilmelding.css";
import { feiletResponsSelectors } from "../../ducks/feiletRespons";
import { kontrollSelectors } from "../../ducks/kontroll";
import { useMemo } from "react";

interface FeilmeldingerProps {
  className?: string;
  exclude?: string[];
}

interface Feilkode {
  kode: string;
  type: string;
}

const Feilmeldinger = ({ className, exclude = [] }: FeilmeldingerProps) => {
  const feilmeldinger = useSelector(feiletResponsSelectors.FeilmeldingerSelector); // inferred as (string | Feilkode)[]
  const kontrollfeil = useSelector(kontrollSelectors.KontrollfeilSelector); // inferred as (string | Feilkode)[]

  const { filteredErrors, warnings } = useMemo(() => {
    if (Utils._isEmpty(feilmeldinger) && Utils._isEmpty(kontrollfeil)) {
      return { filteredErrors: [], warnings: [] };
    }

    const filteredErrors = kontrollfeil
      .concat(feilmeldinger)
      .filter((value) => !exclude?.includes(value.kode))
      .filter((value) => value.type !== "ADVARSEL");
    const warnings = kontrollfeil
      .concat(feilmeldinger)
      .filter((value) => !exclude?.includes(value.kode))
      .filter((value) => value.type === "ADVARSEL");

    return { filteredErrors, warnings };
  }, [feilmeldinger, kontrollfeil, exclude]);

  if (Utils._isEmpty(filteredErrors) && Utils._isEmpty(warnings)) {
    return null;
  }

  const renderErrorList = (errors: (string | Feilkode)[]) => (
    <ul className="feilkoder__liste">
      {errors.map((feil, index) => {
        const key = typeof feil === "string" ? index : feil.kode;
        const displayText =
          typeof feil === "string" ? feil : KV.kodeTilTerm(feil.kode, MKV.KTObjects.begrunnelser.kontroll_begrunnelser);
        return <li key={key}>{displayText}</li>;
      })}
    </ul>
  );

  const classNameFeilmeldinger = classNames("feilmelding", className);
  return (
    <div className={classNameFeilmeldinger}>
      {filteredErrors.length > 0 && (
        <Nav.AlertStripeFeil className="varselstripe">{renderErrorList(filteredErrors)}</Nav.AlertStripeFeil>
      )}
      {warnings.length > 0 && (
        <Nav.AlertStripeAdvarsel className="varselstripe">{renderErrorList(warnings)}</Nav.AlertStripeAdvarsel>
      )}
    </div>
  );
};

export default Feilmeldinger;
