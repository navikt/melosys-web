import React from 'react';

import * as MPT from '../../proptypes/index';
import * as Nav from '../../utils/navFrontend';

import EnkeltDato from '../datoOmrade/enkeltDato';

import './permisjoner.css';

const uuid = require('uuid/v4');

/** Lister en enkeltpermisjon (én linje)
 *
 * @param permisjonen
 */
const Permisjonen = ({ permisjonen }) => {
  const { permisjonsPeriode, permisjonsprosent, permisjonOgPermittering } = permisjonen;
  return (
    <tr className="border-bottom">
      <td>{<EnkeltDato dato={permisjonsPeriode.fom} />} </td>
      <td>{<EnkeltDato dato={permisjonsPeriode.tom} />}</td>
      <td>{permisjonOgPermittering}</td>
      <td>{permisjonsprosent}</td>
    </tr>
  );
};

Permisjonen.propTypes = {
  permisjonen: MPT.Permisjonen.isRequired,
};

/** Lister alle permisjoner i form av en table.
 *
 * @param permisjoner Array med permisjoner.
 */
const Permisjoner = ({ permisjoner }) => (
  <div className="permisjoner">
    <Nav.Undertittel>Permisjoner</Nav.Undertittel>
    <table className="tabellutlisting">
      <tbody>
        <tr>
          <th>Fra</th>
          <th>Til</th>
          <th>Type</th>
          <th>Prosent</th>
        </tr>
        { permisjoner.map(permisjonen => <Permisjonen key={uuid()} permisjonen={permisjonen} />) }
      </tbody>
    </table>
  </div>
);

Permisjoner.propTypes = {
  permisjoner: MPT.Permisjoner.isRequired,
};

export default Permisjoner;
