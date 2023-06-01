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
  exclude?: string[];
};

export default ({ feilmeldinger, className, exclude }: feilmeldingerProps) => {
  if (Utils._isEmpty(feilmeldinger)) {
    return null;
  }

  const renderInnhold = () => {
    if (typeof feilmeldinger === "string") {
      return feilmeldinger;
    }

    const filtrerteFeilmeldinger = feilmeldinger.filter((value) => !exclude?.includes(value.kode));

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
