import * as Nav from "../../../../../navFrontend";
import * as Etiketter from "../../../etiketter";
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
        <Etiketter.FraRegister className={familiemedlemmerClassName.element("fra-register-etikett")} />
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
