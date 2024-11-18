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
  const sumTilFakturaEllerRefusjon = (nyTrygdeavgift ?? 0) - (tidligereTrygdeavgift ?? 0);
  return (
    <div className="sumArsavregningTabell">
      <Nav.Table size="small" width={500} className="periode_tabell">
        <Nav.Table.Row>
          <Nav.Table.DataCell scope="col" />
          <Nav.Table.DataCell width={400} scope="col">
            Endelig beregnet trygdeavgift
          </Nav.Table.DataCell>
          <Nav.Table.DataCell align="right" key={Utils._uuid()}>
            {formaterTilNorskBelop(nyTrygdeavgift !== undefined ? nyTrygdeavgift : tidligereTrygdeavgift)} kr
          </Nav.Table.DataCell>
        </Nav.Table.Row>
        <Nav.Table.Row>
          <Nav.Table.DataCell scope="col">-</Nav.Table.DataCell>
          <Nav.Table.DataCell scope="col">Tidligere beregnet trygdeavgift</Nav.Table.DataCell>
          <Nav.Table.DataCell align="right" key={Utils._uuid()}>
            {formaterTilNorskBelop(tidligereTrygdeavgift || 0)} kr
          </Nav.Table.DataCell>
        </Nav.Table.Row>
        <Nav.Table.Row>
          <Nav.Table.DataCell scope="col">=</Nav.Table.DataCell>
          <Nav.Table.DataCell scope="col">Differanse</Nav.Table.DataCell>
          <Nav.Table.DataCell align="right" key={Utils._uuid()}>
            <b>
              {formaterTilNorskBelop(sumTilFakturaEllerRefusjon)}
              &nbsp;kr&nbsp;
            </b>
          </Nav.Table.DataCell>
        </Nav.Table.Row>
      </Nav.Table>
    </div>
  );
};
