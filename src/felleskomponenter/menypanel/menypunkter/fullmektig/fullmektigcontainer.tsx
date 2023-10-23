import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../navFrontend";
import * as Etiketter from "../../etiketter";

import Fullmektige from "./fullmektige";
import FullmektigeGammel from "./gammel/fullmektige";

import "./fullmektigcontainer.css";
import { useFeatureToggle } from "../../../../featuretoggle";
import { MELOSYS_FULLMAKT_TRYGDEAVGIFT } from "../../../../featuretoggle/toggleNavn";

interface FullmektigProps {
  redigerbart: boolean;
  visArbeidsforholdRolleEtiketter: boolean;
}

const Fullmektig = ({ redigerbart, visArbeidsforholdRolleEtiketter }: FullmektigProps) => {
  const fullmektigToggleEnabled = useFeatureToggle(MELOSYS_FULLMAKT_TRYGDEAVGIFT);
  return (
    <div className="fullmektig__container">
      <div className="tittel">
        <Nav.Typo.Systemtittel style={{ display: "inline", marginRight: "1em" }}>
          {KV.Menypunkter.Fullmektig.tittel}
        </Nav.Typo.Systemtittel>
        {visArbeidsforholdRolleEtiketter && <Etiketter.ArbeidsgiversDel style={{ marginLeft: "0.3em" }} />}
      </div>

      {fullmektigToggleEnabled ? (
        <Fullmektige redigerbart={redigerbart} />
      ) : (
        <FullmektigeGammel redigerbart={redigerbart} />
      )}
    </div>
  );
};

export default Fullmektig;
