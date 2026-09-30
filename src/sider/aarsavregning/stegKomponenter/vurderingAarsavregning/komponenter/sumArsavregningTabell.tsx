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
  tilbakelagtInnbetaltTrygdeavgift,
  harGrunnlagIMelosys,
  tilFaktureringBeloep,
}: {
  nyTrygdeavgift?: number;
  tidligereTrygdeavgift?: number;
  tidligereInnbetaltTrygdeavgift?: number;
  tilbakelagtInnbetaltTrygdeavgift?: number;
  harGrunnlagIMelosys: boolean;
  /** Beløp til fakturering fra backend. Brukes i stedet for summen av radene. */
  tilFaktureringBeloep?: number;
}) {
  const erÅrsavregningEøsPensjonistToggleEnabled = useFeatureToggle(ÅRSAVREGNING_EØS_PENSJONIST);

  const skalViseInnbetaltTrygdeavgift =
    tidligereInnbetaltTrygdeavgift !== undefined && tidligereInnbetaltTrygdeavgift !== null;

  const skalViseTidligereBeregnetTrygdeavgift = erÅrsavregningEøsPensjonistToggleEnabled
    ? !skalViseInnbetaltTrygdeavgift && (harGrunnlagIMelosys || tidligereTrygdeavgift) !== undefined
    : harGrunnlagIMelosys || tidligereTrygdeavgift !== undefined;

  // TODO MELOSYS-8052: Med ÅRSAVREGNING_EØS_PENSJONIST på erstatter innbetalt tidligere beregnet avgift her, mens
  // backend (Årsavregning.beregnTilFaktureringsBeloep) trekker fra begge. Funksjonaliteten er ikke ferdig avklart, og
  // togglen er av i prod. Formelen må samordnes med backend før togglen slås på.
  const lokalSumTilFakturaEllerRefusjon = erÅrsavregningEøsPensjonistToggleEnabled
    ? beregnSumTilFakturaEllerRefusjon(
        nyTrygdeavgift,
        skalViseTidligereBeregnetTrygdeavgift ? tidligereTrygdeavgift : 0,
        skalViseInnbetaltTrygdeavgift ? tidligereInnbetaltTrygdeavgift : 0,
        tilbakelagtInnbetaltTrygdeavgift,
      )
    : beregnSumTilFakturaEllerRefusjon(
        nyTrygdeavgift,
        tidligereTrygdeavgift,
        tidligereInnbetaltTrygdeavgift,
        tilbakelagtInnbetaltTrygdeavgift,
      );
  const sumTilFakturaEllerRefusjon = tilFaktureringBeloep ?? lokalSumTilFakturaEllerRefusjon;

  const innbetaltTrygdeavgiftLabel = erÅrsavregningEøsPensjonistToggleEnabled
    ? "Innbetalt trygdeavgift"
    : "Trygdeavgift fra Avgiftssystemet";

  const tilbakelagtInnbetaltTrygdeavgiftLabel = erÅrsavregningEøsPensjonistToggleEnabled
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
          {tilbakelagtInnbetaltTrygdeavgift !== undefined && tilbakelagtInnbetaltTrygdeavgift !== null && (
            <Nav.Table.Row>
              <Nav.Table.DataCell scope="col">+</Nav.Table.DataCell>
              <Nav.Table.DataCell scope="col">{tilbakelagtInnbetaltTrygdeavgiftLabel}</Nav.Table.DataCell>
              <Nav.Table.DataCell align="right" key={Utils._uuid()}>
                {formaterTilNorskBelop(tilbakelagtInnbetaltTrygdeavgift || 0)} kr
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
