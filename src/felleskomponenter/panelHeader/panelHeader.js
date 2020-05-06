import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../utils/navFrontend';
import './panelHeader.css';


const PanelHeader = ({
  ikon,
  tittel,
  tittelTilleggsinfo,
  undertittel,
}) => (
  <div className="panelheader">
    { ikon && <div className="panelheader__ikon" style={{ backgroundImage: `url('${ikon}')` }} /> }
    <div className="panelheader__tittel">
      <div className="panelheader__tittel__hoved">
        <Nav.typo.Undertittel>{tittel}</Nav.typo.Undertittel>&emsp;
        <Nav.typo.Ingress>{tittelTilleggsinfo}</Nav.typo.Ingress>
      </div>
      <span className="panelheader__tittel__under">{undertittel}</span>
    </div>
  </div>
);

PanelHeader.propTypes = {
  tittel: PT.string.isRequired,
  tittelTilleggsinfo: PT.string,
  ikon: PT.string,
  undertittel: PT.oneOfType([PT.string, PT.node]),
};

PanelHeader.defaultProps = {
  ikon: null,
  tittelTilleggsinfo: '',
  undertittel: '',
};

export default PanelHeader;
