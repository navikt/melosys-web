import { withRouter } from "react-router-dom";
import { withMsal } from "@azure/msal-react";
import { Dropdown } from "@navikt/ds-react";
import PT from "prop-types";

import NavLogo from "../../../resources/images/nav.svg?react";
import * as Nav from "../../../navFrontend";
import useFeatureToggle from "../../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER } from "../../../featuretoggle/toggleNavn";

import "./topplinje.less";
import { HolidayDecor } from "../../../felleskomponenter/høytidOgMorro/holidayDecor";

function Topplinje(props) {
  const { saksbehandler = "" } = props;
  const visTekstblokker = useFeatureToggle(MELOSYS_TEKSTBLOKKER);

  const tilForsidenHandler = (event) => {
    event.preventDefault();
    const { history } = props;
    history.push("/");
  };

  const loggUt = () => {
    props.msalContext.instance.logoutRedirect();
  };

  const erProduksjonsmiljo = `${window.env.CLUSTER}`.startsWith("prod");
  const harAdminMeny = visTekstblokker;

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
      {harAdminMeny && (
        <div className="topplinje__meny">
          <Dropdown>
            <Nav.Button as={Dropdown.Toggle} variant="tertiary-neutral" size="small" className="topplinje__menyknapp">
              Admin
            </Nav.Button>
            <Dropdown.Menu>
              <Dropdown.Menu.List>
                {visTekstblokker && (
                  <Dropdown.Menu.List.Item onClick={() => props.history.push("/administrasjon/tekstblokker")}>
                    Tekstblokker
                  </Dropdown.Menu.List.Item>
                )}
              </Dropdown.Menu.List>
            </Dropdown.Menu>
          </Dropdown>
        </div>
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
