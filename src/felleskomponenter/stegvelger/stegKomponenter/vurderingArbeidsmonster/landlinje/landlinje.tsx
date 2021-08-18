import React, { ComponentProps, InputHTMLAttributes } from "react";

import * as Mui from "../../../../ui";

import "./landlinje.css";

type LandLinjeProps = {
  land: string;
  checkbox: {
    redigerbart: boolean;
    checked: boolean;
    value?: InputHTMLAttributes<HTMLInputElement>["value"];
    onCheck?: ComponentProps<typeof Mui.Checkbox>["onCheck"];
  };
};

const LandLinje = ({ land, checkbox: { redigerbart, checked, value, onCheck } }: LandLinjeProps) => (
  <div className="vurderingArbeidsmonster__landlinje">
    <span>{land}</span>
    <Mui.Checkbox
      disabled={!redigerbart}
      checked={checked}
      value={value}
      onCheck={onCheck}
      label="ja"
      className="vurderingArbeidsmonster__landlinje__marginaltArbeidCheckbox"
    />
  </div>
);

export default LandLinje;
