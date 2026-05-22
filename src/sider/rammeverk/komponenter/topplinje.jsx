import { withRouter } from "react-router-dom";
import { withMsal } from "@azure/msal-react";
import PT from "prop-types";

import NavLogo from "../../../resources/images/nav.svg?react";
import * as Nav from "../../../navFrontend";
import useFeatureToggle from "../../../featuretoggle/useFeatureToggle";
import { MELOSYS_ADMINISTRASJON } from "../../../featuretoggle/toggleNavn";

import "./topplinje.less";
import { HolidayDecor } from "../../../felleskomponenter/høytidOgMorro/holidayDecor";

function Topplinje(props) {
  const { saksbehandler = "" } = props;
  const visAdmin = useFeatureToggle(MELOSYS_ADMINISTRASJON);

  const tilForsidenHandler = (event) => {
    event.preventDefault();
    const { history } = props;
    history.push("/");
  };

  const tilAdministrasjon = (event) => {
    event.preventDefault();
    props.history.push("/administrasjon");
  };

  const loggUt = () => {
    props.msalContext.instance.logoutRedirect();
  };

  const erProduksjonsmiljo = `${window.env.CLUSTER}`.startsWith("prod");
  const visAdminLenke = visAdmin;

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
        <HolidayDecor slot="brand" />
      </div>
      <HolidayDecor slot="center" />
      {visAdminLenke && (
        <nav className="topplinje__meny" aria-label="Administrasjon">
          <a href="/administrasjon" onClick={tilAdministrasjon} className="topplinje__menylenke">
            Admin
          </a>
        </nav>
      )}
      <div className="topplinje__saksbehandler">
        <div className="dropdown">
          <HolidayDecor slot="user" />
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
