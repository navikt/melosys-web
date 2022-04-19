import React from "react";
import { Feilkode } from "../../@types";

import MKV from "../../melosyskodeverk";
import * as Nav from "../../navFrontend";
import * as KV from "../../kodeverk";
import * as Utils from "../../utils";

import "./feilmelding.css";

export default ({ feilmeldinger }: { feilmeldinger: Feilkode[] | string }) => {
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

  return (
    <div className="feilmelding">
      <Nav.AlertStripeFeil className="varselstripe">{renderInnhold()}</Nav.AlertStripeFeil>
    </div>
  );
};
