import MKV from "../../../../../../melosyskodeverk";
import * as KV from "../../../../../../kodeverk";
import * as Utils from "../../../../../../utils";
import { Trygdeavgiftsperiode } from "../../../../../../services/modules/trygdeavgift";
import { Table } from "@navikt/ds-react";

const TrygdeavgiftsperioderTabell = ({ perioder }: { perioder: Trygdeavgiftsperiode[] }) => {
  if (!perioder) return null;

  return (
    <Table size="small" className="periode_tabell">
      <Table.Header className={"header_row"}>
        <Table.Row>
          <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
          <Table.HeaderCell scope="col">Dekning</Table.HeaderCell>
          <Table.HeaderCell scope="col">Inntektskilde</Table.HeaderCell>
          <Table.HeaderCell scope="col">Sats</Table.HeaderCell>
          <Table.HeaderCell scope="col">Avgift per md.</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {perioder.map((trygdeavgiftsperiode) => (
          <Table.Row className="border_top" key={Utils._uuid()}>
            <Table.DataCell key={Utils._uuid()}>
              {`${Utils.dato.formatterDatoTilNorsk(trygdeavgiftsperiode.fom)} - ${Utils.dato.formatterDatoTilNorsk(
                trygdeavgiftsperiode.tom
              )}`}
            </Table.DataCell>
            <Table.DataCell key={Utils._uuid()}>
              {KV.finnTermFraListe(MKV.KTObjects.trygdedekninger, trygdeavgiftsperiode.trygdedekning)}
            </Table.DataCell>
            <Table.DataCell key={Utils._uuid()}>
              {KV.finnTermFraListe(MKV.KTObjects.inntektskildetype, trygdeavgiftsperiode.inntektskildetype)}
            </Table.DataCell>
            <Table.DataCell key={Utils._uuid()}>{trygdeavgiftsperiode.avgiftssats}</Table.DataCell>
            <Table.DataCell key={Utils._uuid()}>
              <b>{trygdeavgiftsperiode.avgiftPerMd}</b> nkr
            </Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default TrygdeavgiftsperioderTabell;
