import { Medlemskapsperiode } from "../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import * as Utils from "../../../../../utils";
import * as KV from "../../../../../kodeverk";
import * as Nav from "../../../../../navFrontend";
import MKV from "../../../../../melosyskodeverk";

const MedlemskapsPerioderTabell = ({ perioder }: { perioder?: Medlemskapsperiode[] }) => {
  if (!perioder) return null;

  return (
    <Nav.Table size="small" className="periode_tabell">
      <Nav.Table.Header className="header_row">
        <Nav.Table.Row>
          <Nav.Table.HeaderCell scope="col">Medlemskap</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell scope="col">Dekning</Nav.Table.HeaderCell>
        </Nav.Table.Row>
      </Nav.Table.Header>
      <Nav.Table.Body>
        {perioder.map((medlemskapsPeriode) => (
          <Nav.Table.Row className="border_top" key={Utils._uuid()}>
            <Nav.Table.DataCell key={Utils._uuid()}>
              {`${Utils.dato.formatterDatoTilNorsk(medlemskapsPeriode.fomDato)} - ${Utils.dato.formatterDatoTilNorsk(
                medlemskapsPeriode.tomDato
              )}`}
            </Nav.Table.DataCell>
            <Nav.Table.DataCell key={Utils._uuid()}>
              {KV.kodeTilTerm(medlemskapsPeriode.trygdedekning, MKV.KTObjects.trygdedekninger)}
            </Nav.Table.DataCell>
          </Nav.Table.Row>
        ))}
      </Nav.Table.Body>
    </Nav.Table>
  );
};

export default MedlemskapsPerioderTabell;
