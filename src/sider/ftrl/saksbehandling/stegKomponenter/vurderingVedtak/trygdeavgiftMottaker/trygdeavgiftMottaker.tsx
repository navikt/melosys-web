import * as Nav from "../../../../../../navFrontend";
import MKV from "../../../../../../melosyskodeverk";

interface TrygdeavgiftMottakerProps {
  mottaker: string;
  betalingsvalg: string;
  erFørstegang: boolean;
}

export function TrygdeavgiftMottaker({ mottaker, betalingsvalg, erFørstegang }: TrygdeavgiftMottakerProps) {
  const betalingsvalgTekst =
    betalingsvalg === MKV.Koder.betalingstype.FAKTURA ? "ved faktura" : "ved trekk i pensjon/uføretrygd";

  return (
    <Nav.Column xs="12" className="trygdeavgiftMottaker">
      <Nav.BodyLong size="small" className="info">
        {mottaker} {erFørstegang ? "" : betalingsvalgTekst}
      </Nav.BodyLong>
    </Nav.Column>
  );
}
