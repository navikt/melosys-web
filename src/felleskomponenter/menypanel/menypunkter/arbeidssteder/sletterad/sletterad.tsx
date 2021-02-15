import React, { MouseEventHandler } from "react";

import * as Ikoner from "../../../../../resources/images";
import * as Mui from "../../../../ui";

import "./sletterad.css";

interface SletteradProps {
  onClick: MouseEventHandler<HTMLAnchorElement>;
}

const Sletterad = ({ onClick }: SletteradProps) => (
  <div className="sletterad">
    <Mui.Knappelenke onClick={onClick} title="Slett" ikon={Ikoner.Bin} className="slett__knapp">
      Slett arbeidssted
    </Mui.Knappelenke>
  </div>
);

export default Sletterad;
