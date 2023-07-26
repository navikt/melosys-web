import * as Utils from "../../../../../../utils";

import { Familiemedlem } from "../../../../../../graphql";

import Ident from "../ident";

interface EktefelleTableProps {
  ektefelleListe: Familiemedlem[];
}

function EktefelleTable({ ektefelleListe }: EktefelleTableProps) {
  return (
    <div className="menypanel__table-wrapper">
      <table className="menypanel__table">
        <tbody>
          <tr className="header">
            <th>Navn</th>
            <th>F.nr./d-nr.</th>
            <th>Fra og med</th>
            <th>Relasjon</th>
          </tr>
          {ektefelleListe.map((ektefelle) => (
            <tr key={Utils._uuid()}>
              <td>{ektefelle.navn}</td>
              <td>
                <Ident ident={ektefelle.ident} />
              </td>
              <td>{Utils.dato.formatterDatoTilNorsk(ektefelle.sivilstand?.gyldigFraOgMed)}</td>
              <td>{ektefelle.sivilstand?.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EktefelleTable;
