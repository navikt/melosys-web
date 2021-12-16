import React from "react";
import classnames from "classnames";
import * as Utils from "../../utils";
import "./mottakerTabell.css";

interface MottakerTabellProps {
  rader: {
    verdi: string | JSX.Element | null;
    style?: string;
  }[][];
  kolonner: {
    verdi: string;
    bredde: string;
    style?: string;
  }[];
  className?: string;
}

const MottakerTabell = ({ rader, kolonner, className = "" }: MottakerTabellProps) => {
  if (!rader || !kolonner) return null;
  const cls = classnames("mottakerTabell", className);
  return (
    <table className={cls}>
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
