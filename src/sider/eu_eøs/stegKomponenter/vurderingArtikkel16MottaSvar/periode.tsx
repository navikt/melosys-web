import * as Nav from "../../../../navFrontend";
import * as Skjema from "../../../../felleskomponenter/skjema";

interface PeriodeProps {
  redigerbart: boolean;
}

const Periode = ({ redigerbart }: PeriodeProps) => (
  <Nav.Row>
    <Nav.Column xs="6">
      <Skjema.Datovelger label="Startdato" feltNavn="endretPeriode.fom" disabled={!redigerbart} />
    </Nav.Column>
    <Nav.Column xs="6">
      <Skjema.Datovelger label="Sluttdato" feltNavn="endretPeriode.tom" disabled={!redigerbart} />
    </Nav.Column>
  </Nav.Row>
);

export default Periode;
