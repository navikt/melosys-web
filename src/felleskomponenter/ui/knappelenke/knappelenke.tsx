import React, { ElementType, ComponentProps, MouseEventHandler } from "react";
import classNames from "classnames";

import * as Nav from "../../../navFrontend";

import "./knappelenke.css";

type NavLenkerProps = ComponentProps<typeof Nav.Lenker>;
type KnappelenkeProps = Omit<NavLenkerProps, "href"> & {
  ikon?: ElementType;
};

const Knappelenke = (props: KnappelenkeProps) => {
  const clickHandler: MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();
    if (props.onClick) props.onClick(e);
  };

  const Ikon = props.ikon;

  const cls = classNames("knappelenke", props.className);

  return (
    <Nav.Lenker {...props} className={cls} href="#" onClick={clickHandler}>
      {Ikon && <Ikon className="ikon" />}
      {props.children && <span>{props.children}</span>}
    </Nav.Lenker>
  );
};

export default Knappelenke;
