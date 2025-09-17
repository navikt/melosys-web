import * as Ikoner from "../../../../../resources/images";
import * as Mui from "../../../../ui";

import "./sletterad.less";

interface SletteradProps {
  onClick: () => void;
}

function Sletterad({ onClick }: SletteradProps) {
  return (
    <div className="sletterad">
      <Mui.IkonKnapp ikon={Ikoner.Bin} ariaLabel="Slett arbeidssted" onClick={onClick} />
    </div>
  );
}

export default Sletterad;
