import React from "react";

import * as Ikoner from "../../../../../resources/images";
import * as Mui from "../../../../ui";

import "./sletterad.css";

interface SletteradProps {
  onClick: () => void;
}

const Sletterad = ({ onClick }: SletteradProps) => (
  <div className="sletterad">
    <Mui.Lenkeknapp onClick={onClick} ikon={Ikoner.Bin} className="slett__knapp">
      Slett arbeidssted
    </Mui.Lenkeknapp>
  </div>
);

export default Sletterad;
