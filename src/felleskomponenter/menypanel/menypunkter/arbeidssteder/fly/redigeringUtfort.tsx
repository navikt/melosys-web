import React from "react";
import classNames from "classnames";

import * as KV from "../../../../../kodeverk";

import MKV from "../../../../../melosyskodeverk";

import { EnRedigeringsknappListeRedigeringUtfort } from "../../editerbartElementListe";

import "./redigeringUtfort.css";

const cls = classNames("tabell", "arbeidssted__fly__redigeringutfort");

const RedigeringUtfort = ({ verdier }: EnRedigeringsknappListeRedigeringUtfort<KV.Form.ArbeidsstedFly>) => (
  <table className={cls}>
    <thead>
      <tr>
        <th>Navn på hjemmebase</th>
        <th>Type flyvninger</th>
        <th>Hjemmebasens land</th>
      </tr>
    </thead>
    <tbody>
      {verdier.map((element, index) => (
        /* eslint-disable-next-line react/no-array-index-key */
        <tr key={index}>
          <td>{element.hjemmebaseNavn}</td>
          <td>{KV.kodeTilTerm(element.typeFlyvninger, MKV.KTObjects.flyvningstyper)}</td>
          <td>{KV.kodeTilTerm(element.hjemmebaseLand, MKV.KTObjects.landkoder)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default RedigeringUtfort;
