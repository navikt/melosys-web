import React, { ComponentProps } from "react";

import * as Mui from "../../../ui";
import * as Ikoner from "../../../../resources/images";

type LenkeknappProps = ComponentProps<typeof Mui.Lenkeknapp>;
type SymbolProps = Omit<LenkeknappProps, "ikon">;

export const Rediger = (props: SymbolProps) => (
  <Mui.Lenkeknapp {...props} onClick={props.onClick} aria-label="Rediger" ikon={Ikoner.Pencil} />
);

export const Slett = (props: SymbolProps) => (
  <Mui.Lenkeknapp {...props} onClick={props.onClick} aria-label="Slett" ikon={Ikoner.Bin} />
);
