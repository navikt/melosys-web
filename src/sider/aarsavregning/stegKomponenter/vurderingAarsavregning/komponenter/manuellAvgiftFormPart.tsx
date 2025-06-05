import { Control } from "react-hook-form";
import * as Forms from "../../../../../felleskomponenter/forms";
import MKV from "../../../../../melosyskodeverk";

const { MANUELL_ENDELIG_AVGIFT } = MKV.Koder.endeligAvgiftValg;

interface ManuellAvgiftFormPartProps {
  control: Control<any>;
  redigerbart: boolean;
  endeligAvgiftValg: string;
  manueltAvgiftBeloep?: number | string;
  debouncedOppdaterManueltAvgiftBeloep: (value: string) => void;
  tidligereTrygdeavgift?: number;
  erMedGrunnlagFlyt: boolean;
  harDeltGrunnlag: boolean;
  totaltForskuddsvisFakturert?: number | string;
  tidligereAarsavregningFakturertAvgiftssystem?: number;
}

export function ManuellAvgiftFormPart({
  control,
  redigerbart,
  endeligAvgiftValg,
  debouncedOppdaterManueltAvgiftBeloep,
}: ManuellAvgiftFormPartProps) {
  if (endeligAvgiftValg !== MANUELL_ENDELIG_AVGIFT) {
    return null;
  }

  return (
    <Forms.Input
      label="Endelig beregnet trygdeavgift"
      name="manueltAvgiftBeloep"
      control={control}
      readOnly={!redigerbart}
      className="avgift_input"
      autoComplete="off"
      type="text"
      numeric
      tillattNegativeTall
      onChange={debouncedOppdaterManueltAvgiftBeloep}
    />
  );
}
