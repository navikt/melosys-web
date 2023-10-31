import classNames from "classnames";
import { useSelector } from "react-redux";

import MKV from "../../melosyskodeverk";
import * as Nav from "../../navFrontend";
import * as KV from "../../kodeverk";

import * as Utils from "../../utils";
import "./feilmelding.css";
import { feiletResponsSelectors } from "../../ducks/feiletRespons";
import { kontrollSelectors } from "../../ducks/kontroll";
import { Feilkode } from "melosys-api";

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

  const mapFeilmelding = (feilmelding: string | Feilkode) =>
    typeof feilmelding === "string"
      ? feilmelding
      : KV.kodeTilTerm(feilmelding.kode, MKV.KTObjects.begrunnelser.kontroll_begrunnelser);

  const renderInnhold = () => {
    if (typeof feilmeldinger === "string") {
      return feilmeldinger;
    }

    const filtrerteFeilmeldinger = kontrollfeil.concat(feilmeldinger).filter((value) => !exclude?.includes(value.kode));

    if (filtrerteFeilmeldinger.length === 0) {
      return null;
    }

    if (filtrerteFeilmeldinger.length === 1) {
      return mapFeilmelding(filtrerteFeilmeldinger[0]);
    }
    return (
      <ul className="feilkoder__liste">
        {filtrerteFeilmeldinger.map((feil) => (
          <li key={feil.kode}>{mapFeilmelding(feil)}</li>
        ))}
      </ul>
    );
  };

  const classNameFeilmeldinger = classNames("feilmelding", className);
  const innhold = renderInnhold();
  if (!innhold) {
    return null;
  }
  return (
    <div className={classNameFeilmeldinger}>
      <Nav.AlertStripeFeil className="varselstripe">{innhold}</Nav.AlertStripeFeil>
    </div>
  );
};
