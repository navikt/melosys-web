import PT from "prop-types";
import classnames from "classnames";
import * as Nav from "../../navFrontend";

import "./knapperad.css";

// TODO: Skriv om til tsx
const Knapperad = ({ bekreft, bekreftTekst, avbryt, avbrytTekst, redigerbart, bekreftRedigerbart, spinner, size }) => {
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
};

Knapperad.propTypes = {
  bekreft: PT.func,
  bekreftTekst: PT.string.isRequired,
  avbryt: PT.func.isRequired,
  avbrytTekst: PT.string.isRequired,
  redigerbart: PT.bool.isRequired,
  bekreftRedigerbart: PT.bool,
  spinner: PT.bool,
  size: PT.string,
};

Knapperad.defaultProps = {
  bekreft: undefined,
  bekreftRedigerbart: true,
  spinner: false,
  size: undefined,
};

export default Knapperad;
