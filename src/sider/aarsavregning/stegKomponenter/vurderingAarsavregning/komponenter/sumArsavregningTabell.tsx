import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";
import "./sumArsavregningTabell.css";
import { formaterTilNorskBelop } from "../../../../../utils";

export const SumArsavregningTabell = ({
  nyTrygdeavgift,
  tidligereTrygdeavgift,
}: {
  nyTrygdeavgift?: number;
  tidligereTrygdeavgift?: number;
}) => {
  return (
    <div className="skjema__panel">
      <Nav.Table size="small" width={500} className="periode_tabell">
        <Nav.Table.Row>
          <Nav.Table.DataCell scope="col" />
          <Nav.Table.DataCell width={400} scope="col">
            Endelig beregnet trygdeavgift
          </Nav.Table.DataCell>
          <Nav.Table.DataCell align="right" key={Utils._uuid()}>
            {formaterTilNorskBelop(nyTrygdeavgift || tidligereTrygdeavgift)} kr
          </Nav.Table.DataCell>
        </Nav.Table.Row>
        <Nav.Table.Row>
          <Nav.Table.DataCell scope="col">-</Nav.Table.DataCell>
          <Nav.Table.DataCell scope="col">Forskuddsvis fakturert trygdeavgift</Nav.Table.DataCell>
          <Nav.Table.DataCell align="right" key={Utils._uuid()}>
            {formaterTilNorskBelop(tidligereTrygdeavgift)} kr
          </Nav.Table.DataCell>
        </Nav.Table.Row>
        <Nav.Table.Row>
          <Nav.Table.DataCell scope="col">=</Nav.Table.DataCell>
          <Nav.Table.DataCell scope="col">Sum til faktura/refusjon </Nav.Table.DataCell>
          <Nav.Table.DataCell align="right" key={Utils._uuid()}>
            <b>
              {formaterTilNorskBelop((nyTrygdeavgift || tidligereTrygdeavgift || 0) - (tidligereTrygdeavgift || 0)) ||
                "0"}{" "}
              kr{" "}
            </b>
          </Nav.Table.DataCell>
        </Nav.Table.Row>
      </Nav.Table>
    </div>
  );
};
