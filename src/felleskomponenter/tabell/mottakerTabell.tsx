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

// TODO: Erstattes med tabell fra Aksel i MELOSYS-6082 (Ideelt sett 1 standardkomponent på tvers av melosys)
const MottakerTabell = ({ rader, kolonner, className = "" }: MottakerTabellProps) => {
  if (!rader || !kolonner) return null;
  const cls = classnames("mottakerTabell", className);
  return (
    <div className="mottakerTabell-wrapper">
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
            <tr key={Utils._uuid()}>
              {rad.map((radElement) => (
                <td key={Utils._uuid()} className={`${radElement.style}`}>
                  {radElement.verdi}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MottakerTabell;
