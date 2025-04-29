import { Control } from "react-hook-form";
import * as Forms from "../../../../../felleskomponenter/forms";
import MKV from "../../../../../melosyskodeverk";
import { AarsavregningResponse } from "../../../../../services/modules/aarsavregning/aarsavregning";
import { SumArsavregningTabell } from "./sumArsavregningTabell"; // Adjusted import path
import { TidligereFakturertIAvgiftssystemetInput } from "./tidligereFakturertIAvgiftssystemetInput"; // Added import

const { MANUELL_ENDELIG_AVGIFT } = MKV.Koder.aarsavregningBehandlingsvalg;

interface ManuellAvgiftFormPartProps {
  control: Control<any>;
  redigerbart: boolean;
  behandlingsvalg: string;
  manueltAvgiftBeloep?: number | string;
  debouncedOppdaterManueltAvgiftBeloep: (value: string) => void;
  aarsavregningResponse?: AarsavregningResponse;
  erMedGrunnlagFlyt: boolean;
  harDeltGrunnlag: boolean;
  totaltForskuddsvisFakturert?: string;
}

export function ManuellAvgiftFormPart({
  control,
  redigerbart,
  behandlingsvalg,
  manueltAvgiftBeloep,
  debouncedOppdaterManueltAvgiftBeloep,
  aarsavregningResponse,
  erMedGrunnlagFlyt,
  harDeltGrunnlag,
  totaltForskuddsvisFakturert,
}: ManuellAvgiftFormPartProps) {
  if (behandlingsvalg !== MANUELL_ENDELIG_AVGIFT) {
    return null;
  }

  const tidligereTrygdeavgiftAvgiftssystem = totaltForskuddsvisFakturert
    ? Number(totaltForskuddsvisFakturert)
    : undefined;

  return (
    <>
      {!erMedGrunnlagFlyt && (
        <TidligereFakturertIAvgiftssystemetInput
          control={control}
          redigerbart={redigerbart}
          harDeltGrunnlag={harDeltGrunnlag}
        />
      )}

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

      {manueltAvgiftBeloep !== undefined &&
        manueltAvgiftBeloep !== null &&
        manueltAvgiftBeloep !== "" &&
        tidligereTrygdeavgiftAvgiftssystem && (
          <SumArsavregningTabell
            harGrunnlagIMelosys={harDeltGrunnlag}
            nyTrygdeavgift={Number(manueltAvgiftBeloep)}
            tidligereTrygdeavgift={aarsavregningResponse?.avregning?.tidligereFakturertBeloep}
            tidligereTrygdeavgiftAvgiftssystem={tidligereTrygdeavgiftAvgiftssystem}
          />
        )}
    </>
  );
}
