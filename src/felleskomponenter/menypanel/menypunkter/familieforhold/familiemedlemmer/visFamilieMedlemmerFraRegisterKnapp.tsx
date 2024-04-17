import * as Nav from "../../../../../navFrontend";
import * as Tags from "../../../tags";
import bem from "../../../../../bemUtils";

import "./familiemedlemmer.css";

interface VisFamilieMedlemmerFraRegisterKnappProps {
  onClick: (visFamilieforholdFraRegister: boolean) => void;
}

const VisFamilieMedlemmerFraRegisterKnapp = ({ onClick }: VisFamilieMedlemmerFraRegisterKnappProps) => {
  const familiemedlemmerClassName = bem("familiemedlemmer");

  return (
    <div className={familiemedlemmerClassName.block}>
      <Nav.Row>
        <Tags.FraRegister className={familiemedlemmerClassName.element("fra-register-etikett")} />
      </Nav.Row>
      <Nav.Hovedknapp
        className={familiemedlemmerClassName.element("vis-familieforhold-knapp")}
        mini
        onClick={() => onClick(true)}
      >
        Vis familieforhold fra register
      </Nav.Hovedknapp>
    </div>
  );
};

export default VisFamilieMedlemmerFraRegisterKnapp;
