import * as Nav from "../../../../../navFrontend";
import * as Tags from "../../../tags";

import "./tittellinje.css";

interface TittellinjeProps {
  tittel: string;
  visArbeidsforholdRolleEtiketter: boolean;
}

function Tittellinje({ tittel, visArbeidsforholdRolleEtiketter }: TittellinjeProps) {
  return (
    <div className="utenlandsoppdraget-tittellinje">
      <Nav.Heading level="2" className="utenlandsoppdraget-tittellinje__tittel">
        {tittel}
      </Nav.Heading>
      {visArbeidsforholdRolleEtiketter && (
        <Tags.ArbeidsgiversDel className="utenlandsoppdraget-tittellinje__arbeidsgiversdel-etikett" />
      )}
    </div>
  );
}

export default Tittellinje;
