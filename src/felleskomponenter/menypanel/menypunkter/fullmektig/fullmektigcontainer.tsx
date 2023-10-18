import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../navFrontend";
import * as Etiketter from "../../etiketter";

import FullmektigeGammel from "./gammel/fullmektige";

import "./fullmektigcontainer.css";

interface FullmektigProps {
  redigerbart: boolean;
  visArbeidsforholdRolleEtiketter: boolean;
}

const Fullmektig = ({ redigerbart, visArbeidsforholdRolleEtiketter }: FullmektigProps) => (
  <div className="fullmektig__container">
    <div className="tittel">
      <Nav.Typo.Systemtittel style={{ display: "inline", marginRight: "1em" }}>
        {KV.Menypunkter.Fullmektig.tittel}
      </Nav.Typo.Systemtittel>
      {visArbeidsforholdRolleEtiketter && <Etiketter.ArbeidsgiversDel style={{ marginLeft: "0.3em" }} />}
    </div>
    <FullmektigeGammel redigerbart={redigerbart} />
  </div>
);

export default Fullmektig;
