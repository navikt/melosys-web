import { Table } from "@navikt/ds-react";
import * as Utils from "../../../../../utils";
import "../vurderingAarsavregning.css";
import { SkatteforholdDto } from "../../../../../services/modules/trygdeavgift";
import MKV from "../../../../../melosyskodeverk";

const { SKATTEPLIKTIG } = MKV.Koder.skatteplikttype;

const SkatteforholdsPerioderTabell = ({ perioder }: { perioder?: SkatteforholdDto[] }) => {
  if (!perioder) return null;

  return (
    <Table size="small" className="periode_tabell">
      <Table.Header className="header_row">
        <Table.Row>
          <Table.HeaderCell scope="col">Skatteforhold</Table.HeaderCell>
          <Table.HeaderCell scope="col">Skattepliktig</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {perioder.map((skatteforholdsPeriode) => (
          <Table.Row className="border_top" key={Utils._uuid()}>
            <Table.DataCell key={Utils._uuid()}>
              {`${Utils.dato.formatterDatoTilNorsk(skatteforholdsPeriode.fomDato)} - ${Utils.dato.formatterDatoTilNorsk(
                skatteforholdsPeriode.tomDato
              )}`}
            </Table.DataCell>
            <Table.DataCell key={Utils._uuid()}>
              {skatteforholdsPeriode.skatteplikttype === SKATTEPLIKTIG ? "Ja" : "Nei"}
            </Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default SkatteforholdsPerioderTabell;
