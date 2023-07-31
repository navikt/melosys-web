import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";

import { EnRedigeringsknappListeRedigeringUtfort } from "../../editerbartElementListe";

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
