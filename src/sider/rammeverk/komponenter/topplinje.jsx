import { withRouter } from "react-router-dom";
import { withMsal } from "@azure/msal-react";
import PT from "prop-types";

import { ReactComponent as NavLogo } from "../../../resources/images/nav.svg";
import * as Nav from "../../../navFrontend";

import "./topplinje.css";

const Topplinje = (props) => {
  const { saksbehandler } = props;

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
        <button onClick={tilForsidenHandler} className="topplinje__brandKnapp" type="button">
          <NavLogo className="brand__logo" alt="To personer på NAV kontor" />
        </button>
        <div className="brand__skillelinje" />
        <div className="brand__tittel">
          <span>Melosys</span>
        </div>
      </div>
      <div className="topplinje__saksbehandler">
        <div className="dropdown">
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
};

Topplinje.propTypes = {
  saksbehandler: PT.string,
  history: PT.object.isRequired,
  msalContext: PT.object.isRequired,
};

Topplinje.defaultProps = {
  saksbehandler: "",
};
export default withMsal(withRouter(Topplinje));
