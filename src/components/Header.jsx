import * as React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';


import * as navLogo from '../resources/images/nav.svg';
import * as saksbehandlerIkon from '../resources/images/saksbehandler.svg';
import '../index.css';
import './header.css';

const Header = ({
  saksbehandlerName,
}) => <header className="headerContainer">
  <div className="topplinje">
    <div>
      <div className="logo">
        <Link to="/" alt="NAV, lenke hovedsiden">
          <img
            className="headerIkon"
            src={navLogo}
            alt="To personer på NAV kontor"
          />
        </Link>
      </div>
      <div className="headerDivider" />
    </div>
    <h4 className="text"><span>Medlemsskap og lovvalgssystem</span></h4>
    <div className="saksbehandler">
      <img className="saksbehandlerIkon" src={saksbehandlerIkon} alt="Saksbehandler" />
      <div className="saksbehandlerTekst">{saksbehandlerName}</div>
    </div>
  </div>
</header>;

Header.propTypes = {
  saksbehandlerName: PropTypes.string.isRequired,
};
Header.defaultProps = {
  saksbehandlerName: 'IKKE DEFINERT',
};
export default Header;
