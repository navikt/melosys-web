import React from "react";
import * as Ikon from ".";
import { KjoennType } from "../../graphql";

type KjoennProps = {
  className: string;
  kjoenn: KjoennType;
};

export const Kjoenn = ({ className, kjoenn }: KjoennProps) => {
  if (!kjoenn) return <Ikon.Ukjentkjoenn className={className} />;
  switch (kjoenn) {
    case KjoennType.Mann:
      return <Ikon.Mann className={className} />;
    case KjoennType.Kvinne:
      return <Ikon.Kvinne className={className} />;
    default:
      return <Ikon.Ukjentkjoenn className={className} />;
  }
};
