import classNames from "classnames";

import * as KV from "../../../../../kodeverk";

import MKV from "../../../../../melosyskodeverk";

import { EnRedigeringsknappListeRedigeringUtfort } from "../../editerbartElementListe";

import "./redigeringUtfort.css";

const cls = classNames("tabell", "arbeidssted__utland__redigeringutfort");

// TODO: Erstattes med tabell fra Aksel i MELOSYS-6082 (Ideelt sett 1 standardkomponent på tvers av melosys)
const RedigeringUtfort = ({ verdier }: EnRedigeringsknappListeRedigeringUtfort<KV.Form.ArbeidsstedSkip>) => (
  <div className="arbeidssted__utland__redigeringutfort-wrapper">
    <table className={cls}>
      <thead>
        <tr>
          <th>Navn på skip</th>
          <th>Fartsområde</th>
          <th>Flaggstat/lands territorialfarvann</th>
        </tr>
      </thead>
      <tbody>
        {verdier.map((element, index) => (
          /* eslint-disable-next-line react/no-array-index-key */
          <tr key={index}>
            <td>{element.enhetNavn}</td>
            <td>{KV.kodeTilTerm(element.fartsomradeKode, MKV.KTObjects.begrunnelser.fartsomrader)}</td>
            {element.flaggLandkode && <td>{KV.kodeTilTerm(element.flaggLandkode, MKV.KTObjects.landkoder)}</td>}
            {element.territorialfarvann && (
              <td>{KV.kodeTilTerm(element.territorialfarvann, MKV.KTObjects.landkoder)}</td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default RedigeringUtfort;
