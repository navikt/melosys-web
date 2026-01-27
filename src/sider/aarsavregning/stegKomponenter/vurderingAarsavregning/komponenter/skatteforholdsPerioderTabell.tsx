import { SkatteforholdDto } from "../../../../../services/modules/trygdeavgift";
import * as Utils from "../../../../../utils";
import * as Nav from "../../../../../navFrontend";
import MKV from "../../../../../melosyskodeverk";

const { SKATTEPLIKTIG } = MKV.Koder.skatteplikttype;

function SkatteforholdsPerioderTabell({ perioder }: { perioder?: SkatteforholdDto[] }) {
  if (!perioder) return null;

  const sortertePerioder = [...perioder].sort(Utils.dato.sorterEtterISOFomDato);

  return (
    <Nav.Table size="small" className="periode_tabell">
      <Nav.Table.Header className="header_row">
        <Nav.Table.Row>
          <Nav.Table.HeaderCell scope="col">Skatteforhold</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell scope="col">Skattepliktig</Nav.Table.HeaderCell>
        </Nav.Table.Row>
      </Nav.Table.Header>
      <Nav.Table.Body>
        {sortertePerioder.map((skatteforholdsPeriode) => (
          <Nav.Table.Row className="border_top" key={Utils._uuid()}>
            <Nav.Table.DataCell key={Utils._uuid()}>
              {`${Utils.dato.formatterDatoTilNorsk(skatteforholdsPeriode.fomDato)} - ${Utils.dato.formatterDatoTilNorsk(
                skatteforholdsPeriode.tomDato,
              )}`}
            </Nav.Table.DataCell>
            <Nav.Table.DataCell key={Utils._uuid()}>
              {skatteforholdsPeriode.skatteplikttype === SKATTEPLIKTIG ? "Ja" : "Nei"}
            </Nav.Table.DataCell>
          </Nav.Table.Row>
        ))}
      </Nav.Table.Body>
    </Nav.Table>
  );
}

export default SkatteforholdsPerioderTabell;
