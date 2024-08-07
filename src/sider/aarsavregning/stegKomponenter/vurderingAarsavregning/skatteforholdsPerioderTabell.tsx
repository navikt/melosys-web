import { Skatteforholdsperiode } from "../../../../services/modules/aarsavregning/aarsavregning";
import * as Utils from "../../../../utils";
import * as Nav from "../../../../navFrontend";
import "./vurderingAarsavregning.css";

const SkatteforholdsPerioderTabell = ({ perioder }: { perioder?: Skatteforholdsperiode[] }) => {
  if (!perioder) return null;

  return (
    <Nav.Table size="small" className="periode_tabell">
      <Nav.Table.Header className="header_row">
        <Nav.Table.Row>
          <Nav.Table.HeaderCell scope="col">Skatteforhold</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell scope="col">Skattepliktig</Nav.Table.HeaderCell>
        </Nav.Table.Row>
      </Nav.Table.Header>
      <Nav.Table.Body>
        {perioder.map((skatteforholdsPeriode) => (
          <Nav.Table.Row className="border_top" key={Utils._uuid()}>
            <Nav.Table.DataCell key={Utils._uuid()}>
              {`${Utils.dato.formatterDatoTilNorsk(skatteforholdsPeriode.fom)} - ${Utils.dato.formatterDatoTilNorsk(
                skatteforholdsPeriode.tom
              )}`}
            </Nav.Table.DataCell>
            <Nav.Table.DataCell key={Utils._uuid()}>
              {skatteforholdsPeriode.skatteplikttype ? "Ja" : "Nei"}
            </Nav.Table.DataCell>
          </Nav.Table.Row>
        ))}
      </Nav.Table.Body>
    </Nav.Table>
  );
};

export default SkatteforholdsPerioderTabell;
