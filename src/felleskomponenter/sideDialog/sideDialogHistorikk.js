import React from 'react';
import { Link } from 'react-router-dom';

import './sideDialogHistorikk.css';

const SideDialogHistorikk = () => (
  <div className="sideDialogHistorikk">
    <ul>
      <li><Link className="lenke" to="http://www.google.com">10.10.2018: Søknad oppdatert med ny informasjon</Link></li>
      <li><Link className="lenke" to="http://www.google.com">12.10.2018: Dialog med søker</Link></li>
      <li><Link className="lenke" to="http://www.google.com">10.10.2018: Søknad sendt</Link></li>
    </ul>
  </div>
);

export default SideDialogHistorikk;
