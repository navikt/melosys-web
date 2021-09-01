import React, { useState } from "react";
import * as Ikon from "../../../../resources/images";
import "./behandlingsmeny.css";
import LeggBehandlingTilbake from "./leggbehandlingtilbake";
import AvsluttSak from "./avsluttsak";
import Handling from "./handling";

const Behandlingsmeny = () => {
  const [visBehandlingsmeny, setVisBehandlingsmeny] = useState(false);

  const toggleBehandlingsmeny = () => setVisBehandlingsmeny(!visBehandlingsmeny);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      toggleBehandlingsmeny();
    }
  };

  const visSaksoversikt = () => {
    console.log("Vis saksoversikt");
  };
  const vurderSakenPaaNytt = () => {
    console.log("vurderSakenPaaNytt");
  };

  const classNameKnapp = `behandlingsmeny__knapp${visBehandlingsmeny ? " behandlingsmeny__knapp__aapen" : ""}`;
  const classNameHamburger = `hamburger${visBehandlingsmeny ? " hamburger__aapen" : ""}`;

  return (
    <div className="behandlingsmeny">
      <div
        className={classNameKnapp}
        role="button"
        tabIndex={0}
        onClick={toggleBehandlingsmeny}
        onKeyPress={handleKeyPress}
      >
        <Ikon.Hamburger className={classNameHamburger} />
      </div>
      {visBehandlingsmeny && (
        <div className="behandlingsmeny__padding">
          <div className="behandlingsmeny__meny">
            <LeggBehandlingTilbake />
            <AvsluttSak />
            <div className="behandlingsmeny__meny__handlinger">
              <Handling ikon={<Ikon.Copy />} tekst="Vis saksoversikt" onClick={visSaksoversikt} />
              <Handling ikon={<Ikon.Cancel />} tekst="Vurder saken på nytt" onClick={vurderSakenPaaNytt} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Behandlingsmeny;
