import PT from "prop-types";
import classNames from "classnames";

import * as Nav from "../../navFrontend";

import "./elementskrift.less";

function Elementskrift({ ikon: Ikon, tekst, className }) {
  const cl = classNames("elementskrift", className);

  return (
    <Nav.BodyLong weight="semibold" size="small" className={cl}>
      <Ikon className="ikon" />
      {tekst}
    </Nav.BodyLong>
  );
}

Elementskrift.propTypes = {
  ikon: PT.elementType.isRequired,
  tekst: PT.string.isRequired,
  className: PT.string,
};

export default Elementskrift;
