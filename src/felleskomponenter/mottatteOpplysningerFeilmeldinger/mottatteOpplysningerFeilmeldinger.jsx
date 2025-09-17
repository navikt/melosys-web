import { Fragment } from "react";
import PT from "prop-types";
import { connect } from "react-redux";
import { formSelectors } from "../../ducks/form";

import * as Nav from "../../navFrontend";

import "./mottatteOpplysningerFeilmeldinger.less";

export function MottatteOpplysningerFeilmeldinger({ panelFeil = [] }) {
  if (panelFeil.length === 0) return null;

  return (
    <Nav.Alert className="mottatteopplysninger_feilmeldinger" variant="warning">
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
    </Nav.Alert>
  );
}

MottatteOpplysningerFeilmeldinger.propTypes = {
  panelFeil: PT.arrayOf(
    PT.shape({
      feil: PT.arrayOf(PT.string),
      panel: PT.string.isRequired,
    }),
  ),
};

const mapStateToProps = (state) => ({
  panelFeil: formSelectors.PanelFeilSelector(state),
});

export default connect(mapStateToProps)(MottatteOpplysningerFeilmeldinger);
