import React from "react";
import { Feilkode } from "../../@types";

import MKV from "../../melosyskodeverk";
import * as Nav from "../../navFrontend";
import * as KV from "../../kodeverk";

import "./valideringsfeil.css";

export default ({ feilkoder }: { feilkoder: Feilkode[] }) => {
  if (!feilkoder.length) {
    return null;
  }
  return (
    <Nav.AlertStripeFeil className="varselstripe">
      {feilkoder.length === 1 ? (
        KV.kodeTilTerm(feilkoder[0].kode, MKV.KTObjects.begrunnelser.kontroll_begrunnelser)
      ) : (
        <ul className="feilkoder__liste">
          {feilkoder.map((feil) => (
            <li key={feil.kode}>{KV.kodeTilTerm(feil.kode, MKV.KTObjects.begrunnelser.kontroll_begrunnelser)}</li>
          ))}
        </ul>
      )}
    </Nav.AlertStripeFeil>
  );
};
