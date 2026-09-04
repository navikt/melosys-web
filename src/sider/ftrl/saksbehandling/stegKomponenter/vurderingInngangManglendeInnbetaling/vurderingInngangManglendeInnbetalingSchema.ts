import { object, string } from "yup";
import * as KV from "../../../../../kodeverk";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;

const vurderingManglendeInnbetalingValg = [
  "HELE_PERIODEN_OPPHØRES",
  "DELER_AV_PERIODEN_OPPHØRES",
  "VEDTAKET_SKAL_ENDRES",
  "BEHANDLINGEN_SKAL_AVSLUTTES",
] as const;

export type VurderingInngangManglendeInnbetaling = (typeof vurderingManglendeInnbetalingValg)[number];

const vurdering_inngang_manglende_innbetaling = object().shape({
  fullstendigManglendeInnbetaling: string()
    .oneOf([...vurderingManglendeInnbetalingValg])
    .required(MAA_FYLLES_UT),
});

export default vurdering_inngang_manglende_innbetaling;
