import * as Ikoner from "../../../../../resources/images";
import * as Mui from "../../../../ui";

import "./sletterad.css";

interface SletteradProps {
  onClick: () => void;
}

const Sletterad = ({ onClick }: SletteradProps) => (
  <div className="sletterad">
    <Mui.IkonKnapp ikon={Ikoner.Bin} ariaLabel="Slett arbeidssted" onClick={onClick} />
  </div>
);

export default Sletterad;
