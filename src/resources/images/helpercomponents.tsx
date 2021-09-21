import React from "react";
import * as Ikon from "./";

type KjoennProps = {
  className: string;
  kjoenn: string;
};

export const Kjoenn = ({ className, kjoenn }: KjoennProps) => {
  if (!kjoenn) return <Ikon.Ukjentkjoenn className={className} />;
  switch (kjoenn) {
    case "M":
    case "MANN":
      return <Ikon.Mann className={className} />;
    case "K":
    case "KVINNE":
      return <Ikon.Kvinne className={className} />;
    default:
      return <Ikon.Ukjentkjoenn className={className} />;
  }
};
