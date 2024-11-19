import * as Nav from "../../../../../navFrontend";
import * as Tags from "../../../tags";

import "./tittellinje.css";

interface TittellinjeProps {
  tittel: string;
  visArbeidsforholdRolleEtiketter: boolean;
}

const Tittellinje = ({ tittel, visArbeidsforholdRolleEtiketter }: TittellinjeProps) => (
  <div className="utenlandsoppdraget-tittellinje">
    <Nav.Heading size="small" className="utenlandsoppdraget-tittellinje__tittel">
      {tittel}
    </Nav.Heading>
    {visArbeidsforholdRolleEtiketter && (
      <Tags.ArbeidsgiversDel className="utenlandsoppdraget-tittellinje__arbeidsgiversdel-etikett" />
    )}
  </div>
);

export default Tittellinje;
