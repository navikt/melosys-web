import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../utils/navFrontend';
import './panelHeader.css';


const PanelHeader = ({ ikon, tittel, undertittel }) => (
  <div className="panelheader">
    { ikon && <div className="panelheader__ikon" style={{ backgroundImage: `url('${ikon}')` }} /> }
    <div className="panelheader__tittel">
      <Nav.Undertittel className="panelheader__tittel__hoved">{tittel}</Nav.Undertittel>
      <span className="panelheader__tittel__under">{undertittel}</span>
    </div>
  </div>
);

PanelHeader.propTypes = {
  tittel: PT.string.isRequired,
  ikon: PT.string,
  undertittel: PT.oneOfType([PT.string, PT.node]),
};

PanelHeader.defaultProps = {
  ikon: null,
  undertittel: '',
};

export default PanelHeader;
