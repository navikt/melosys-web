import React from "react";
import * as Ikon from "./";

type KjoennProps = {
  className: string;
  kjoennKode: string;
};

export const Kjoenn = ({ className, kjoennKode }: KjoennProps) => {
  if (!kjoennKode) return <Ikon.Ukjentkjoenn className={className} />;
  switch (kjoennKode) {
    case "M":
      return <Ikon.Mann className={className} />;
    case "K":
      return <Ikon.Kvinne className={className} />;
    default:
      return <Ikon.Ukjentkjoenn className={className} />;
  }
};
