import React, { Fragment } from "react";
import PT from "prop-types";
import { connect } from "react-redux";
import { formSelectors } from "../../ducks/form";

import * as Nav from "../../navFrontend";

import "./mottatteOpplysningerFeilmeldinger.css";

export const MottatteOpplysningerFeilmeldinger = ({ panelFeil }) => {
  if (panelFeil.length === 0) return null;

  return (
    <Nav.AlertStripe className="feilmelding" type="advarsel">
      Ugyldige felter. Sjekk følgende menypunkt(er):
      <ul>
        {panelFeil.map(({ panel, feil }) => (
          <Fragment key={panel}>
            <li>{panel}</li>
            {feil.map((enkeltFeil) => (
              <li className="feilElement" key={enkeltFeil}>
                {enkeltFeil}
              </li>
            ))}
          </Fragment>
        ))}
      </ul>
    </Nav.AlertStripe>
  );
};

MottatteOpplysningerFeilmeldinger.propTypes = {
  panelFeil: PT.arrayOf(
    PT.shape({
      feil: PT.arrayOf(PT.string),
      panel: PT.string.isRequired,
    })
  ),
};

MottatteOpplysningerFeilmeldinger.defaultProps = {
  panelFeil: [],
};

const mapStateToProps = (state) => ({
  panelFeil: formSelectors.PanelFeilSelector(state),
});

export default connect(mapStateToProps)(MottatteOpplysningerFeilmeldinger);
