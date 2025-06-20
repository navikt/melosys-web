import { Control } from "react-hook-form";
import * as Forms from "../../../../../felleskomponenter/forms";

interface ManuellAvgiftFormPartProps {
  control: Control<any>;
  redigerbart: boolean;
  debouncedOppdaterManueltAvgiftBeloep: (value: string) => void;
  tidligereAarsavregningErManueltBeregnet: boolean;
}

export function ManuellAvgiftFormPart({
  control,
  redigerbart,
  debouncedOppdaterManueltAvgiftBeloep,
  tidligereAarsavregningErManueltBeregnet,
}: ManuellAvgiftFormPartProps) {
  return (
    <Forms.Input
      label="Endelig beregnet trygdeavgift"
      description={
        tidligereAarsavregningErManueltBeregnet ? "Du skal kun endre hvis tidligere oppgitte beløp er feil" : ""
      }
      name="manueltAvgiftBeloep"
      control={control}
      readOnly={!redigerbart}
      className="avgift_input"
      autoComplete="off"
      type="text"
      numeric
      onChange={debouncedOppdaterManueltAvgiftBeloep}
    />
  );
}
