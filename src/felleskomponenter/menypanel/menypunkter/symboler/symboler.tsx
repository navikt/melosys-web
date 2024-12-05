import { ComponentProps } from "react";

import * as Mui from "../../../ui";
import * as Ikoner from "../../../../resources/images";

type IkonKnappProps = ComponentProps<typeof Mui.IkonKnapp>;
type SymbolProps = Omit<IkonKnappProps, "ikon" | "ariaLabel">;

export function Rediger(props: SymbolProps) {
  const { onClick } = props;
  return <Mui.IkonKnapp {...props} onClick={onClick} ariaLabel="Rediger" ikon={Ikoner.Pencil} />;
}

export function Slett(props: SymbolProps) {
  const { onClick } = props;
  return <Mui.IkonKnapp {...props} onClick={onClick} ariaLabel="Slett" ikon={Ikoner.Bin} />;
}
