import * as Nav from "../../../../../navFrontend";
import * as Tags from "../../../tags";
import bem from "../../../../../bemUtils";

import "./familiemedlemmer.less";

interface VisFamilieMedlemmerFraRegisterKnappProps {
  onClick: (visFamilieforholdFraRegister: boolean) => void;
}

function VisFamilieMedlemmerFraRegisterKnapp({ onClick }: VisFamilieMedlemmerFraRegisterKnappProps) {
  const familiemedlemmerClassName = bem("familiemedlemmer");

  return (
    <div className={familiemedlemmerClassName.block}>
      <Nav.Row>
        <Tags.FraRegister className={familiemedlemmerClassName.element("fra-register-etikett")} />
      </Nav.Row>
      <Nav.Button
        variant="primary"
        className={familiemedlemmerClassName.element("vis-familieforhold-knapp")}
        onClick={() => onClick(true)}
      >
        Vis familieforhold fra register
      </Nav.Button>
    </div>
  );
}

export default VisFamilieMedlemmerFraRegisterKnapp;
