import React, { ComponentProps } from "react";

import * as Mui from "../../../ui";
import * as Ikoner from "../../../../resources/images";

type IkonKnappProps = ComponentProps<typeof Mui.IkonKnapp>;
type SymbolProps = Omit<IkonKnappProps, "ikon" | "ariaLabel">;

export const Rediger = (props: SymbolProps) => (
  <Mui.IkonKnapp {...props} onClick={props.onClick} ariaLabel="Rediger" ikon={Ikoner.Pencil} />
);

export const Slett = (props: SymbolProps) => (
  <Mui.IkonKnapp {...props} onClick={props.onClick} ariaLabel="Slett" ikon={Ikoner.Bin} />
);
