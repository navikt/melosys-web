import { Familiemedlem } from "../../../../../../graphql";

import Ident from "../ident";
import * as StringUtils from "../../../../../../utils/streng";
import * as Etiketter from "../../../../etiketter";
import * as Utils from "../../../../../../utils";

interface BarnTableProps {
  barnListe: Familiemedlem[];
}

function BarnTable({ barnListe }: BarnTableProps) {
  return (
    <div className="menypanel__table-wrapper">
      <table className="menypanel__table">
        <tbody>
          <tr className="header">
            <th>Navn</th>
            <th>F.nr./d-nr.</th>
            <th>Foreldreansvar</th>
            <th>F.nr. annen forelder</th>
            <th>&nbsp;</th>
          </tr>
          {barnListe.map((barn) => (
            <tr key={Utils._uuid()}>
              <td>{barn.navn}</td>
              <td>
                <Ident ident={barn.ident} />
              </td>
              <td>{StringUtils.storeForbokstaver(barn.foreldreansvar)}</td>
              <td>{barn.fnrAnnenForelder}</td>
              <td>{barn.alder && barn.alder < 18 ? <Etiketter.Under18Aar /> : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BarnTable;
