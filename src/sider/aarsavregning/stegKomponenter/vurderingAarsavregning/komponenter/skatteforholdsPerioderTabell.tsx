import { Table } from "@navikt/ds-react";
import { Skatteforholdsperiode } from "../../../../../services/modules/aarsavregning/aarsavregning";
import * as Utils from "../../../../../utils";
import "../vurderingAarsavregning.css";

const SkatteforholdsPerioderTabell = ({ perioder }: { perioder?: Skatteforholdsperiode[] }) => {
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
              {`${Utils.dato.formatterDatoTilNorsk(skatteforholdsPeriode.fom)} - ${Utils.dato.formatterDatoTilNorsk(
                skatteforholdsPeriode.tom
              )}`}
            </Table.DataCell>
            <Table.DataCell key={Utils._uuid()}>{skatteforholdsPeriode.skatteplikttype ? "Ja" : "Nei"}</Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default SkatteforholdsPerioderTabell;
