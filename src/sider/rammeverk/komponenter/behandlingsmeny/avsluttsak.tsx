import React from "react";
import * as Nav from "../../../../utils/navFrontend";
import Handling from "./handling";

const AvsluttSak = () => {
  const avslaaSoknad = () => {
    console.log("avslå");
  };

  const henleggSak = () => {
    console.log("henlegg");
  };

  const avsluttSakSomBortfalt = () => {
    console.log("avslutt");
  };

  return (
    <Nav.EkspanderbartpanelBase
      ariaTittel="avsluttsak"
      className="behandlingsmeny__meny__avslutt-sak"
      heading={<div className="title">Avslutt sak</div>}
    >
      <Handling tekst="Avslå søknad pga. manglende opplysninger" onClick={avslaaSoknad} />
      <Handling tekst="Henlegg sak" onClick={henleggSak} />
      <Handling tekst="Avslutt sak som bortfalt" onClick={avsluttSakSomBortfalt} />
    </Nav.EkspanderbartpanelBase>
  );
};

export default AvsluttSak;
