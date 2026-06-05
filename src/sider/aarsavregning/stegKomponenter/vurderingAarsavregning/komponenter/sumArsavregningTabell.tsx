import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";
import "./sumArsavregningTabell.less";
import { formaterTilNorskBelop } from "../../../../../utils";
import { beregnSumTilFakturaEllerRefusjon } from "../utils";
import { ÅRSAVREGNING_EØS_PENSJONIST } from "../../../../../featuretoggle/toggleNavn";
import useFeatureToggle from "../../../../../featuretoggle/useFeatureToggle";

export function SumArsavregningTabell({
  nyTrygdeavgift,
  tidligereTrygdeavgift,
  tidligereInnbetaltTrygdeavgift,
  tidligereAarsavregningInnbetaltTrygdeavgift,
  harGrunnlagIMelosys,
}: {
  nyTrygdeavgift?: number;
  tidligereTrygdeavgift?: number;
  tidligereInnbetaltTrygdeavgift?: number;
  tidligereAarsavregningInnbetaltTrygdeavgift?: number;
  harGrunnlagIMelosys: boolean;
}) {
  const erÅrsavregningEøsPensjonistToggleEnabled = useFeatureToggle(ÅRSAVREGNING_EØS_PENSJONIST);

  const skalViseInnbetaltTrygdeavgift =
    tidligereInnbetaltTrygdeavgift !== undefined && tidligereInnbetaltTrygdeavgift !== null;

  const skalViseTidligereBeregnetTrygdeavgift = erÅrsavregningEøsPensjonistToggleEnabled
    ? !skalViseInnbetaltTrygdeavgift && (harGrunnlagIMelosys || tidligereTrygdeavgift) !== undefined
    : harGrunnlagIMelosys || tidligereTrygdeavgift !== undefined;

  const sumTilFakturaEllerRefusjon = erÅrsavregningEøsPensjonistToggleEnabled
    ? beregnSumTilFakturaEllerRefusjon(
        nyTrygdeavgift,
        skalViseTidligereBeregnetTrygdeavgift ? tidligereTrygdeavgift : 0,
        skalViseInnbetaltTrygdeavgift ? tidligereInnbetaltTrygdeavgift : 0,
        tidligereAarsavregningInnbetaltTrygdeavgift,
      )
    : beregnSumTilFakturaEllerRefusjon(
        nyTrygdeavgift,
        tidligereTrygdeavgift,
        tidligereInnbetaltTrygdeavgift,
        tidligereAarsavregningInnbetaltTrygdeavgift,
      );

  const innbetaltTrygdeavgiftLabel = erÅrsavregningEøsPensjonistToggleEnabled
    ? "Innbetalt trygdeavgift"
    : "Trygdeavgift fra Avgiftssystemet";

  const tidligereAarsavregningInnbetaltTrygdeavgiftLabel = erÅrsavregningEøsPensjonistToggleEnabled
    ? "Tidligere innbetalt trygdeavgift"
    : "Tidligere trygdeavgift fra Avgiftssystemet";

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
          {skalViseTidligereBeregnetTrygdeavgift && (
            <Nav.Table.Row>
              <Nav.Table.DataCell scope="col">-</Nav.Table.DataCell>
              <Nav.Table.DataCell scope="col">Tidligere beregnet trygdeavgift</Nav.Table.DataCell>
              <Nav.Table.DataCell align="right" key={Utils._uuid()}>
                {formaterTilNorskBelop(tidligereTrygdeavgift || 0)} kr
              </Nav.Table.DataCell>
            </Nav.Table.Row>
          )}
          {tidligereAarsavregningInnbetaltTrygdeavgift !== undefined &&
            tidligereAarsavregningInnbetaltTrygdeavgift !== null && (
              <Nav.Table.Row>
                <Nav.Table.DataCell scope="col">+</Nav.Table.DataCell>
                <Nav.Table.DataCell scope="col">{tidligereAarsavregningInnbetaltTrygdeavgiftLabel}</Nav.Table.DataCell>
                <Nav.Table.DataCell align="right" key={Utils._uuid()}>
                  {formaterTilNorskBelop(tidligereAarsavregningInnbetaltTrygdeavgift || 0)} kr
                </Nav.Table.DataCell>
              </Nav.Table.Row>
            )}
          {skalViseInnbetaltTrygdeavgift && (
            <Nav.Table.Row>
              <Nav.Table.DataCell scope="col">-</Nav.Table.DataCell>
              <Nav.Table.DataCell scope="col">{innbetaltTrygdeavgiftLabel}</Nav.Table.DataCell>
              <Nav.Table.DataCell align="right" key={Utils._uuid()}>
                {formaterTilNorskBelop(tidligereInnbetaltTrygdeavgift || 0)} kr
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
