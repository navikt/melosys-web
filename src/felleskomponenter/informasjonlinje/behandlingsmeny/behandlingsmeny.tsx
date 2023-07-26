import { KeyboardEvent, useState } from "react";
import classNames from "classnames";
import * as Ikon from "../../../resources/images";
import LeggBehandlingTilbake from "./leggbehandlingtilbake";
import AvsluttSak from "./avsluttsak";
import "./behandlingsmeny.css";

export const Behandlingsmeny = () => {
  const [visBehandlingsmeny, setVisBehandlingsmeny] = useState(false);

  const toggleBehandlingsmeny = () => setVisBehandlingsmeny(!visBehandlingsmeny);

  const handleKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      toggleBehandlingsmeny();
    }
  };

  const knappCls = classNames("behandlingsmeny__knapp", { behandlingsmeny__knapp__aapen: visBehandlingsmeny });
  const hamburgerCls = classNames("behandlingsmeny__hamburger", {
    behandlingsmeny__hamburger__aapen: visBehandlingsmeny,
  });

  return (
    <div className="behandlingsmeny">
      <div
        className={knappCls}
        role="button"
        tabIndex={0}
        onClick={toggleBehandlingsmeny}
        onKeyPress={handleKeyPress}
        aria-label="Behandlingsmeny"
        title="Behandlingsmeny"
      >
        <Ikon.Hamburger className={hamburgerCls} />
      </div>
      {visBehandlingsmeny && (
        <div className="behandlingsmeny__meny">
          <LeggBehandlingTilbake />
          <AvsluttSak />
        </div>
      )}
    </div>
  );
};

export default Behandlingsmeny;
