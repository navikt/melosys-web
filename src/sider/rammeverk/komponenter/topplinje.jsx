import { withRouter } from "react-router-dom";
import { withMsal } from "@azure/msal-react";
import PT from "prop-types";

import NavLogo from "../../../resources/images/nav.svg?react";
import * as Nav from "../../../navFrontend";

import "./topplinje.less";
import { MistelteinSvg } from "../../../felleskomponenter/høytidOgMorro/jul/MistelteinSvg";
import { ChristmasSantaAndDeer } from "../../../felleskomponenter/høytidOgMorro/jul/ChristmasSantaAndDeer";
import { ChristmasDeer } from "../../../felleskomponenter/høytidOgMorro/jul/ChristmasReindeer";

function Topplinje(props) {
  const { saksbehandler = "" } = props;

  const tilForsidenHandler = (event) => {
    event.preventDefault();
    const { history } = props;
    history.push("/");
  };

  const loggUt = () => {
    props.msalContext.instance.logoutRedirect();
  };

  const erProduksjonsmiljo = `${window.env.CLUSTER}`.startsWith("prod");

  return (
    <header className="topplinje">
      <a className="skip-link" href="#main-container">
        <Nav.Heading size="small">Hopp til hovedinnhold</Nav.Heading>
      </a>
      <div className="topplinje__brand">
        <a onClick={tilForsidenHandler} href="/" className="topplinje__brandKnapp" aria-label="Gå til forsiden">
          <NavLogo className="brand__logo" alt="NAV logo" />
        </a>
        <div className="brand__skillelinje" />
        <div className="brand__tittel">
          <span>Melosys</span>
        </div>
        <ChristmasDeer />
      </div>
      <ChristmasSantaAndDeer />
      <div className="topplinje__saksbehandler">
        <div className="dropdown">
          <MistelteinSvg />
          <div className="saksbehandler__navn ">{saksbehandler}</div>
          {!erProduksjonsmiljo && (
            <div className="dropdown-content">
              <button type="button" onClick={loggUt}>
                Logg ut
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

Topplinje.propTypes = {
  saksbehandler: PT.string,
  history: PT.object.isRequired,
  msalContext: PT.object.isRequired,
};

export default withMsal(withRouter(Topplinje));
