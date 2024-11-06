import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";

import "./feilmeldingDialog.css";

interface Feilmelding {
  tittel: string;
  innhold: string;
}

interface FeilmeldingDialogProps {
  avbryt: () => void;
  feilmeldinger: Feilmelding[];
}

export const FeilmeldingDialog = ({ avbryt, feilmeldinger }: FeilmeldingDialogProps) => {
  return (
    <Nav.Modal
      onClose={avbryt}
      className="feilmeldingDialog"
      open
      closeOnBackdropClick
      header={{ heading: "Valideringsmeldinger" }}
    >
      <Nav.Modal.Body>
        {feilmeldinger.map((feilmelding) => (
          <div className="validering" key={Utils._uuid()}>
            <Nav.Typo.Element className="valideringKode">{feilmelding.tittel}</Nav.Typo.Element>
            <Nav.Typo.Normaltekst>{feilmelding.innhold}</Nav.Typo.Normaltekst>
          </div>
        ))}
      </Nav.Modal.Body>
    </Nav.Modal>
  );
};

export default FeilmeldingDialog;
