import React, { ElementType, MouseEventHandler } from "react";
import classnames from "classnames";

import * as Nav from "../../../../navFrontend";
import * as Symboler from "../symboler";

import { Symbolsynlighet } from "./types";

import "./legend.css";

interface LegendProps {
  tittelIkon?: ElementType;
  tittelUnderstrek?: boolean;
  tittel: string;
  redigerbart: boolean;
  onBinClick: MouseEventHandler;
  onPencilClick: MouseEventHandler;
  symbolsynlighet: Symbolsynlighet;
}

const Legend = ({
  tittelIkon: TittelIkon,
  tittelUnderstrek,
  tittel,
  redigerbart,
  onBinClick,
  onPencilClick,
  symbolsynlighet,
}: LegendProps) => {
  const legendCls = classnames("editerbart-element__legend", {
    "editerbart-element__legend--understrek": tittelUnderstrek,
  });

  const renderSymboler = () => {
    if (!redigerbart) return null;

    const { pencil, bin } = symbolsynlighet;

    return (
      <span className="editerbart-element__legend__symboler">
        {pencil && <Symboler.Rediger onClick={onPencilClick} />}
        {bin && <Symboler.Slett onClick={onBinClick} />}
      </span>
    );
  };

  return (
    <div className={legendCls}>
      <span className="editerbart-element__legend__tittel-container">
        {TittelIkon && (
          <span className="editerbart-element__legend__tittel-container__tittelikon">
            <TittelIkon />
          </span>
        )}
        <Nav.Typo.Undertittel className="editerbart-element__legend__tittel-container__tittel">
          {tittel}
        </Nav.Typo.Undertittel>
      </span>
      {renderSymboler()}
    </div>
  );
};

export default Legend;
