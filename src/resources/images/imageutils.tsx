import React from "react";
import { KTObject } from "@navikt/melosys-kodeverk";
import * as Ikon from "./";
import * as KV from "../../kodeverk";

type KjoennProps = {
  className: string;
  kjoenn: KTObject;
};

export const Kjoenn = ({ className, kjoenn }: KjoennProps) => {
  if (!kjoenn) return <Ikon.Ukjentkjoenn className={className} />;
  switch (KV.objektTilKode(kjoenn)) {
    case "M":
      return <Ikon.Mann className={className} />;
    case "K":
      return <Ikon.Kvinne className={className} />;
    default:
      return <Ikon.Ukjentkjoenn className={className} />;
  }
};
