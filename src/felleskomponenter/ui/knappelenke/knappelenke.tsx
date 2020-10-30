import React, { ElementType, ComponentProps, MouseEventHandler } from 'react';

import * as Nav from '../../../utils/navFrontend';

type NavLenkerProps = ComponentProps<typeof Nav.Lenker>;
type KnappelenkeProps = Omit<NavLenkerProps, 'href'> & {
  ikon?: ElementType,
};

const Knappelenke = (props: KnappelenkeProps) => {
  const clickHandler: MouseEventHandler<HTMLAnchorElement> = e => {
    e.preventDefault();
    if (props.onClick) props.onClick(e);
  };

  const Ikon = props.ikon;

  return (
    <Nav.Lenker
      {...props}
      href="#"
      onClick={clickHandler}
    >
      {Ikon && <Ikon className="ikon" />}
      {
        props.children &&
        <span>{props.children}</span>
      }
    </Nav.Lenker>
  );
};

export default Knappelenke;
