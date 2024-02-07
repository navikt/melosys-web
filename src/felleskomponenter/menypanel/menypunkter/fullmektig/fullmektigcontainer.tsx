import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../navFrontend";
import * as Etiketter from "../../etiketter";

import Fullmektige from "./fullmektige";
import "./fullmektigcontainer.css";
import ChevronKnapp from "../../../chevronKnapp/chevronKnapp";
import { useState } from "react";
import FullmektigHistorikk from "./fullmektigHistorikk";

interface FullmektigProps {
  redigerbart: boolean;
  visArbeidsforholdRolleEtiketter: boolean;
}

const Fullmektig = ({ redigerbart, visArbeidsforholdRolleEtiketter }: FullmektigProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fullmektig__container">
      <div className="tittel">
        <Nav.Typo.Systemtittel style={{ display: "inline", marginRight: "1em" }}>
          {KV.Menypunkter.Fullmektig.tittel}
        </Nav.Typo.Systemtittel>
        {visArbeidsforholdRolleEtiketter && <Etiketter.ArbeidsgiversDel style={{ marginLeft: "0.3em" }} />}
      </div>
      <Fullmektige redigerbart={redigerbart} />
      <ChevronKnapp
        expanded={expanded}
        onChange={() => setExpanded(!expanded)}
        label={expanded ? "Lukk historikk" : "Vis historikk"}
      />
      {expanded && (
        <div className="fullmektigHistorikk">
          <FullmektigHistorikk />
        </div>
      )}
    </div>
  );
};

export default Fullmektig;
