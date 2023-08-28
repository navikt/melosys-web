import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";

import { EnRedigeringsknappListeRedigeringUtfort } from "../../editerbartElementListe";

// TODO: Erstattes med tabell fra Aksel i MELOSYS-6082 (Ideelt sett 1 standardkomponent på tvers av melosys)
const RedigeringUtfort = ({ verdier }: EnRedigeringsknappListeRedigeringUtfort<KV.Form.MedfolgendeFamilie>) => (
  <div className="menypanel__table-wrapper">
    <table className="menypanel__table">
      <tbody>
        <tr className="header">
          <th>F.nr./d-nr.</th>
          <th>Navn</th>
        </tr>
        {verdier.map((verdi) => (
          <tr key={Utils._uuid()}>
            <td>{verdi.fnr}</td>
            <td>{verdi.navn}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default RedigeringUtfort;
