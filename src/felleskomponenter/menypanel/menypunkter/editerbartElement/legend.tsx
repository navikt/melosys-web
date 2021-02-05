import React, { ElementType, MouseEventHandler } from "react";
import classnames from "classnames";

import * as Nav from "../../../../utils/navFrontend";
import * as Symboler from "../symboler";

import { Status } from "./types";

import "./legend.css";

interface LegendProps {
  status: Status;
  tittelIkon?: ElementType;
  tittelUnderstrek?: boolean;
  tittel: string;
  redigerbart: boolean;
  onBinClick: MouseEventHandler;
  onPencilClick: MouseEventHandler;
  visAlltidBin: boolean;
}

const Legend = ({
  status,
  tittelIkon: TittelIkon,
  tittelUnderstrek,
  tittel,
  redigerbart,
  onBinClick,
  onPencilClick,
  visAlltidBin,
}: LegendProps) => {
  const legendCls = classnames("editerbart-element__legend", {
    "editerbart-element__legend--understrek": tittelUnderstrek,
  });

  const renderSymboler = () => {
    if (!redigerbart) return null;

    return (
      <>
        {status === Status.RedigeringUtfort && (
          <Symboler.Rediger style={{ marginRight: "10px" }} onClick={onPencilClick} />
        )}
        {(status === Status.RedigeringUtfort || visAlltidBin) && <Symboler.Slett onClick={onBinClick} />}
      </>
    );
  };

  return (
    <div className={legendCls}>
      <span style={{ marginRight: "10px" }}>
        {TittelIkon && <TittelIkon style={{ marginRight: "5px" }} />}
        <Nav.typo.Undertittel style={{ display: "inline" }}>{tittel}</Nav.typo.Undertittel>
      </span>
      {renderSymboler()}
    </div>
  );
};

export default Legend;
