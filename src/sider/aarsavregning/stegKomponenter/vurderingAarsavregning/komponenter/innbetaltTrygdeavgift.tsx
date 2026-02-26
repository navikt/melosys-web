import "../vurderingAarsavregningInngang.less";
import * as Nav from "../../../../../navFrontend";

interface InnbetaltTrygdeavgiftInputProps {
  redigerbart: boolean;
}

export function InnbetaltTrygdeavgiftInput({ redigerbart }: InnbetaltTrygdeavgiftInputProps) {
  return (
    <Nav.TextField
      label="Innbetalt trygdeavgift"
      readOnly={!redigerbart}
      className="innbetatlt_input"
      autoComplete="off"
      type="text"
      inputMode="numeric"
    />
  );
}
