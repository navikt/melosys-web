import "../vurderingAarsavregningInngang.less";
import { Control } from "react-hook-form";
import * as Forms from "../../../../../felleskomponenter/forms";

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
  return (
    <Forms.Input
      label="Innbetalt trygdeavgift"
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
