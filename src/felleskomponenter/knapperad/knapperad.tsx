import classnames from "classnames";
import * as Nav from "../../navFrontend";

import "./knapperad.less";
import { MouseEventHandler } from "react";

interface KnapperadProps {
  bekreft?: MouseEventHandler<HTMLButtonElement>;
  bekreftTekst: string;
  avbryt?: MouseEventHandler<HTMLButtonElement>;
  avbrytTekst: string;
  redigerbart: boolean;
  bekreftRedigerbart?: boolean;
  spinner?: boolean;
  size?: "small" | "medium" | "xsmall";
}

function Knapperad({
  bekreft,
  bekreftTekst,
  avbryt,
  avbrytTekst,
  redigerbart,
  bekreftRedigerbart = true,
  spinner,
  size,
}: KnapperadProps) {
  const cls = classnames("container__knapperad");

  return (
    <div className={cls}>
      <Nav.Button variant="primary" onClick={bekreft} disabled={!redigerbart || !bekreftRedigerbart} loading={spinner}>
        {bekreftTekst}
      </Nav.Button>
      <Nav.Button variant="tertiary" size={size} onClick={avbryt} disabled={!redigerbart}>
        {avbrytTekst}
      </Nav.Button>
    </div>
  );
}

export default Knapperad;
