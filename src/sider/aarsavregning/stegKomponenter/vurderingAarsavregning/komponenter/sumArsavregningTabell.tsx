import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";
import "./sumArsavregningTabell.css";
import { formaterTilNorskBelop } from "../../../../../utils";
import { beregnSumTilFakturaEllerRefusjon } from "../utils";

export function SumArsavregningTabell({
  nyTrygdeavgift,
  tidligereTrygdeavgift,
  tidligereTrygdeavgiftAvgiftssystem,
  tidligereAarsavregningTrygdeavgiftFraAvgiftssystem,
  harGrunnlagIMelosys,
}: {
  nyTrygdeavgift?: number;
  tidligereTrygdeavgift?: number;
  tidligereTrygdeavgiftAvgiftssystem?: number;
  tidligereAarsavregningTrygdeavgiftFraAvgiftssystem?: number;
  harGrunnlagIMelosys: boolean;
}) {
  const sumTilFakturaEllerRefusjon = beregnSumTilFakturaEllerRefusjon(
    nyTrygdeavgift,
    tidligereTrygdeavgift,
    tidligereTrygdeavgiftAvgiftssystem,
    tidligereAarsavregningTrygdeavgiftFraAvgiftssystem,
  );

  return (
    <Nav.Box className="sumArsavregningTabell" background="surface-subtle">
      <Nav.Table size="small" width={500} className="periode_tabell">
        <Nav.Table.Body>
          <Nav.Table.Row>
            <Nav.Table.DataCell scope="col" />
            <Nav.Table.DataCell width={400} scope="col">
              Endelig beregnet trygdeavgift
            </Nav.Table.DataCell>
            <Nav.Table.DataCell align="right" key={Utils._uuid()}>
              {formaterTilNorskBelop(nyTrygdeavgift || 0)} kr
            </Nav.Table.DataCell>
          </Nav.Table.Row>
          {(harGrunnlagIMelosys || tidligereTrygdeavgift !== undefined) && (
            <Nav.Table.Row>
              <Nav.Table.DataCell scope="col">-</Nav.Table.DataCell>
              <Nav.Table.DataCell scope="col">Tidligere beregnet trygdeavgift</Nav.Table.DataCell>
              <Nav.Table.DataCell align="right" key={Utils._uuid()}>
                {formaterTilNorskBelop(tidligereTrygdeavgift || 0)} kr
              </Nav.Table.DataCell>
            </Nav.Table.Row>
          )}
          {tidligereAarsavregningTrygdeavgiftFraAvgiftssystem !== undefined &&
            tidligereAarsavregningTrygdeavgiftFraAvgiftssystem !== null && (
              <Nav.Table.Row>
                <Nav.Table.DataCell scope="col">+</Nav.Table.DataCell>
                <Nav.Table.DataCell scope="col">Tidligere trygdeavgift fra Avgiftssystemet</Nav.Table.DataCell>
                <Nav.Table.DataCell align="right" key={Utils._uuid()}>
                  {formaterTilNorskBelop(tidligereAarsavregningTrygdeavgiftFraAvgiftssystem || 0)} kr
                </Nav.Table.DataCell>
              </Nav.Table.Row>
            )}
          {tidligereTrygdeavgiftAvgiftssystem !== undefined && tidligereTrygdeavgiftAvgiftssystem !== null && (
            <Nav.Table.Row>
              <Nav.Table.DataCell scope="col">-</Nav.Table.DataCell>
              <Nav.Table.DataCell scope="col">Trygdeavgift fra Avgiftssystemet</Nav.Table.DataCell>
              <Nav.Table.DataCell align="right" key={Utils._uuid()}>
                {formaterTilNorskBelop(tidligereTrygdeavgiftAvgiftssystem || 0)} kr
              </Nav.Table.DataCell>
            </Nav.Table.Row>
          )}
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
        </Nav.Table.Body>
      </Nav.Table>
    </Nav.Box>
  );
}
