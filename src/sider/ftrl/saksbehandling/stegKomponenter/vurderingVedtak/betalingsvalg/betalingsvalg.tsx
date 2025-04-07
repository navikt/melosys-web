import * as Nav from "../../../../../../navFrontend";
import "./betalingsvalg.css";

interface BetalingsvalgProps {
  skalSendeFaktura: boolean;
  onBetalingsvalgChange: () => void;
  redigerbart: boolean;
}

export function Betalingsvalg({ skalSendeFaktura, onBetalingsvalgChange, redigerbart }: BetalingsvalgProps) {
  return (
    <Nav.Column xs="12" className="betalingsvalg">
      <Nav.Checkbox
        checked={skalSendeFaktura}
        onChange={() => onBetalingsvalgChange()}
        readOnly={!redigerbart}
        size="small"
        className="betalingsvalg-checkbox"
      >
        <Nav.BodyLong size="small" className="info">
          Bruker skal motta faktura i stedet for trekk i pensjon/uføretrygd
        </Nav.BodyLong>
      </Nav.Checkbox>
    </Nav.Column>
  );
}
