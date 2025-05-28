import { Control } from "react-hook-form";
import * as Forms from "../../../../../felleskomponenter/forms";
import MKV from "../../../../../melosyskodeverk";
import { SumArsavregningTabell } from "./sumArsavregningTabell";
import { TidligereFakturertIAvgiftssystemetInput } from "./tidligereFakturertIAvgiftssystemetInput";

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
}

export function ManuellAvgiftFormPart({
  control,
  redigerbart,
  endeligAvgiftValg,
  manueltAvgiftBeloep,
  debouncedOppdaterManueltAvgiftBeloep,
  tidligereTrygdeavgift,
  erMedGrunnlagFlyt,
  harDeltGrunnlag,
  totaltForskuddsvisFakturert,
}: ManuellAvgiftFormPartProps) {
  if (endeligAvgiftValg !== MANUELL_ENDELIG_AVGIFT) {
    return null;
  }

  const tidligereTrygdeavgiftAvgiftssystem = totaltForskuddsvisFakturert
    ? Number(totaltForskuddsvisFakturert)
    : undefined;

  return (
    <>
      {!erMedGrunnlagFlyt && <TidligereFakturertIAvgiftssystemetInput control={control} redigerbart={redigerbart} />}

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

      {manueltAvgiftBeloep !== undefined && manueltAvgiftBeloep !== null && manueltAvgiftBeloep !== "" && (
        <SumArsavregningTabell
          harGrunnlagIMelosys={erMedGrunnlagFlyt || harDeltGrunnlag}
          nyTrygdeavgift={Number(manueltAvgiftBeloep)}
          tidligereTrygdeavgift={tidligereTrygdeavgift}
          tidligereTrygdeavgiftAvgiftssystem={tidligereTrygdeavgiftAvgiftssystem}
        />
      )}
    </>
  );
}
