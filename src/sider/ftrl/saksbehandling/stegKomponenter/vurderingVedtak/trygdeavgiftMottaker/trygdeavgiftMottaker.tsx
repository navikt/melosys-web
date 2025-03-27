import * as Nav from "../../../../../../navFrontend";
import MKV from "../../../../../../melosyskodeverk";

interface TrygdeavgiftMottakerProps {
  mottaker: string;
  betalingsvalg: string;
}

export function TrygdeavgiftMottaker({ mottaker, betalingsvalg }: TrygdeavgiftMottakerProps) {
  const betalingsvalgTekst =
    betalingsvalg === MKV.Koder.betalingstype.FAKTURA ? "ved faktura" : "ved trekk i pensjon/uføretrygd";

  return (
    <Nav.Column xs="12" className="trygdeavgiftMottaker">
      <Nav.BodyLong size="small" className="info">
        {mottaker} {betalingsvalgTekst}
      </Nav.BodyLong>
    </Nav.Column>
  );
}
