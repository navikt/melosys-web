import * as Nav from "../../../../../../navFrontend";

interface SendFakturaProps {
  skalSendeFaktura: boolean;
  onSendFakturaChange: (checked: boolean) => void;
}

export function SendFaktura({ skalSendeFaktura, onSendFakturaChange }: SendFakturaProps) {
  return (
    <div className="sendFaktura">
      <Nav.Checkbox checked={skalSendeFaktura} onChange={(e) => onSendFakturaChange(e.target.checked)}>
        Send faktura
      </Nav.Checkbox>
    </div>
  );
}
