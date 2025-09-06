import PT from "prop-types";

import * as Nav from "../../../navFrontend";

import "./avsender/avsender.less";

function PreutfyltAvsender({ className, avsenderID, avsenderNavn }) {
  return (
    <div className={className}>
      <Nav.BodyLong weight="semibold" size="small" className="linje">
        Avsender ID
      </Nav.BodyLong>
      <Nav.BodyLong size="small" className="linje">
        {avsenderID}
      </Nav.BodyLong>
      <Nav.BodyLong weight="semibold" size="small" className="linje">
        Avsenders navn
      </Nav.BodyLong>
      <Nav.BodyLong size="small" className="linje">
        {avsenderNavn}
      </Nav.BodyLong>
    </div>
  );
}

PreutfyltAvsender.propTypes = {
  className: PT.string.isRequired,
  avsenderID: PT.string.isRequired,
  avsenderNavn: PT.string.isRequired,
};
export default PreutfyltAvsender;
