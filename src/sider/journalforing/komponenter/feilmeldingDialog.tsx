import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";

import "./feilmeldingDialog.less";

interface Feilmelding {
  tittel: string;
  innhold: string;
}

interface FeilmeldingDialogProps {
  avbryt: () => void;
  feilmeldinger: Feilmelding[];
}

export function FeilmeldingDialog({ avbryt, feilmeldinger }: FeilmeldingDialogProps) {
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
            <Nav.BodyLong weight="semibold" size="small" className="valideringKode">
              {feilmelding.tittel}
            </Nav.BodyLong>
            <Nav.BodyLong size="small">{feilmelding.innhold}</Nav.BodyLong>
          </div>
        ))}
      </Nav.Modal.Body>
    </Nav.Modal>
  );
}

export default FeilmeldingDialog;
