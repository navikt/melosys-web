import { Table } from "@navikt/ds-react";
import * as Utils from "../../../../../utils";
import "../vurderingAarsavregning.css";
import * as KV from "../../../../../kodeverk";
import MKV from "../../../../../melosyskodeverk";
import { Medlemskapsperiode } from "../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";

const MedlemskapsPerioderTabell = ({ perioder }: { perioder?: Medlemskapsperiode[] }) => {
  if (!perioder) return null;

  return (
    <Table size="small" className="periode_tabell">
      <Table.Header className="header_row">
        <Table.Row>
          <Table.HeaderCell scope="col">Medlemskap</Table.HeaderCell>
          <Table.HeaderCell scope="col">Dekning</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {perioder.map((medlemskapsPeriode) => (
          <Table.Row className="border_top" key={Utils._uuid()}>
            <Table.DataCell key={Utils._uuid()}>
              {`${Utils.dato.formatterDatoTilNorsk(medlemskapsPeriode.fomDato)} - ${Utils.dato.formatterDatoTilNorsk(
                medlemskapsPeriode.tomDato
              )}`}
            </Table.DataCell>
            <Table.DataCell key={Utils._uuid()}>
              {KV.kodeTilTerm(medlemskapsPeriode.trygdedekning, MKV.KTObjects.trygdedekninger)}
            </Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default MedlemskapsPerioderTabell;
