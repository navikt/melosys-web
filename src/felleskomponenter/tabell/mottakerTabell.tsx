import React from "react";
import * as Utils from "../../utils";
import "./mottakerTabell.css";

interface MottakerTabellProps {
  rader: {
    verdi: string | JSX.Element;
    style?: string;
  }[][];
  kolonner: {
    verdi: string;
    bredde: string;
    style?: string;
  }[];
}

const MottakerTabell = ({ rader, kolonner }: MottakerTabellProps) => {
  if (!rader || !kolonner) return null;
  return (
    <table className="mottakerTabell">
      <tbody>
        <tr>
          {kolonner.map((kolonne) => (
            <th key={Utils._uuid()} className={`${kolonne.style}`} style={{ width: kolonne.bredde }}>
              {kolonne.verdi}
            </th>
          ))}
        </tr>
        {rader.map((rad) => (
          <tr className="border_bottom" key={Utils._uuid()}>
            {rad.map((radElement) => (
              <td key={Utils._uuid()} className={`${radElement.style}`}>
                {radElement.verdi}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MottakerTabell;
