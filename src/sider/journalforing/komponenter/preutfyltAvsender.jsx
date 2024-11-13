import PT from "prop-types";

import * as Nav from "../../../navFrontend";

import "./avsender/avsender.css";

const PreutfyltAvsender = ({ className, avsenderID, avsenderNavn }) => (
  <div className={className}>
    <Nav.Typo.Element className="linje">Avsender ID</Nav.Typo.Element>
    <Nav.BodyLong size="small" className="linje">
      {avsenderID}
    </Nav.BodyLong>
    <Nav.Typo.Element className="linje">Avsenders navn</Nav.Typo.Element>
    <Nav.BodyLong size="small" className="linje">
      {avsenderNavn}
    </Nav.BodyLong>
  </div>
);

PreutfyltAvsender.propTypes = {
  className: PT.string.isRequired,
  avsenderID: PT.string.isRequired,
  avsenderNavn: PT.string.isRequired,
};
export default PreutfyltAvsender;
