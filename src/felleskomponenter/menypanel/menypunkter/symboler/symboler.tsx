import React, { ComponentProps } from "react";

import * as Mui from "../../../ui";
import * as Ikoner from "../../../../resources/images";

type KnappeLenkeProps = ComponentProps<typeof Mui.Knappelenke>;
type SymbolProps = Omit<KnappeLenkeProps, "title" | "ikon">;

export const Rediger = (props: SymbolProps) => (
  <Mui.Knappelenke {...props} onClick={props.onClick} title="Rediger" ikon={Ikoner.Pencil} />
);

export const Slett = (props: SymbolProps) => (
  <Mui.Knappelenke {...props} onClick={props.onClick} title="Slett" ikon={Ikoner.Bin} />
);
