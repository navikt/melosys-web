import React from "react";
import classNames from "classnames";
import { Feilkode } from "../../@types";

import MKV from "../../melosyskodeverk";
import * as Nav from "../../navFrontend";
import * as KV from "../../kodeverk";
import * as Utils from "../../utils";

import "./feilmelding.css";

type feilmeldingerProps = {
  feilmeldinger: Feilkode[] | string;
  className?: string;
};

export default ({ feilmeldinger, className }: feilmeldingerProps) => {
  if (Utils._isEmpty(feilmeldinger)) {
    return null;
  }

  const renderInnhold = () => {
    if (typeof feilmeldinger === "string") {
      return feilmeldinger;
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

  const classNameFeilmeldinger = classNames("feilmelding", className);

  return (
    <div className={classNameFeilmeldinger}>
      <Nav.AlertStripeFeil className="varselstripe">{renderInnhold()}</Nav.AlertStripeFeil>
    </div>
  );
};
