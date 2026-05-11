import "../vurderingAarsavregningInngang.less";
import { Control } from "react-hook-form";
import * as Forms from "../../../../../felleskomponenter/forms";
import { useFeatureToggle } from "../../../../../featuretoggle";
import { ÅRSAVREGNING_EØS_PENSJONIST } from "../../../../../featuretoggle/toggleNavn";
interface InnbetaltTrygdeavgiftInputProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  redigerbart: boolean;
  erNyAarsavregning: boolean;
}

export function InnbetaltTrygdeavgiftInput({
  control,
  redigerbart,
  erNyAarsavregning,
}: InnbetaltTrygdeavgiftInputProps) {
  const label = useFeatureToggle(ÅRSAVREGNING_EØS_PENSJONIST)
    ? "Innbetalt trygdeavgift"
    : "Trygdeavgift fra Avgiftssystemet";

  return (
    <Forms.Input
      label={label}
      description={erNyAarsavregning ? "Du skal kun endre hvis tidligere oppgitte beløp er feil" : ""}
      name="innbetaltTrygdeavgift"
      control={control}
      readOnly={!redigerbart}
      className="avgift_input"
      autoComplete="off"
      type="text"
      numeric
    />
  );
}
