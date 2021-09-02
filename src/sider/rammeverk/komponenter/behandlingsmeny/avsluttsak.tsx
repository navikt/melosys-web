import React from "react";
import * as Nav from "../../../../utils/navFrontend";
import Handling from "./handling";

type avsluttSakProps = {
  avslaaSoknad: () => void;
  henleggSak: () => void;
  avsluttSakSomBortfalt: () => void;
};

const AvsluttSak = ({ avslaaSoknad, henleggSak, avsluttSakSomBortfalt }: avsluttSakProps) => {
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
