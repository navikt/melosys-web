import React from 'react';
import { Link } from 'react-router-dom';

import './sideDialogDokumenter.css';

const SideDialogDokumenter = () => (
  // Todo: Innholdet i denne komponenten er uferdig fra arkitektur og forretningssiden.
  <div className="sideDialogDokumenter">
    <ul>
      <li><Link className="lenke" to="http://www.google.com">Attest for lorem ipsum (10.10.2018)</Link></li>
      <li><Link className="lenke" to="http://www.google.com">Dokument for dolor sit amet (10.10.2018)</Link></li>
      <li><Link className="lenke" to="http://www.google.com">Dokument Lorem ipsum (10.10.2018)</Link></li>
    </ul>
  </div>
);

export default SideDialogDokumenter;
