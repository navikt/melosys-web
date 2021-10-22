import React from "react";

import * as Utils from "../../../../../../utils";

const PeriodeTabell = ({ perioder }: { perioder: string[][] | undefined }) => {
  if (!perioder) return null;
  return (
    <table className="periode_tabell">
      <tbody>
        <tr>
          <th key={Utils._uuid()} style={{ width: "30%" }} scope="col">
            Periode
          </th>
          <th key={Utils._uuid()} style={{ width: "40%" }} scope="col">
            Dekning
          </th>
          <th key={Utils._uuid()} style={{ width: "10%" }} scope="col">
            Sats
          </th>
          <th key={Utils._uuid()} style={{ width: "20%" }} scope="col">
            Avgift per måned
          </th>
        </tr>
        {perioder.map((avgiftsPeriode) => (
          <tr className="border_top" key={Utils._uuid()}>
            {avgiftsPeriode.map((listeElement: string) => (
              <td key={Utils._uuid()}>{listeElement}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PeriodeTabell;
