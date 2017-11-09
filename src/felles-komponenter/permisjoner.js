import React from 'react';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';

import EnkeltDato from './datoOmrade/enkeltDato';

import './permisjoner.css';

const uuid = require('uuid/v4');

function Permisjonen({ permisjonen }) {
  const { permisjonsPeriode, permisjonsId, permisjonsprosent, permisjonOgPermittering, arbeidsgiver } = permisjonen;
  return (
    <tr>
      <td>{<EnkeltDato dato={permisjonsPeriode.fom} />} </td>
      <td>{<EnkeltDato dato={permisjonsPeriode.tom} />}</td>
      <td>{permisjonsId}</td>
      <td>{permisjonsprosent}</td>
      <td>{arbeidsgiver.navn}</td>
      <td>{permisjonOgPermittering}</td>
    </tr>
  );
}

Permisjonen.propTypes = {
  permisjonen: MPT.Permisjonen.isRequired,
};

function Permisjoner({ permisjoner }) {
  return (
    <div className="permisjoner panelSeksjon">
      <Nav.EkspanderbartPanel tittel="Permisjoner">
        <section aria-label="permisjoner">
          <Nav.Container fluid>
            <table className="tabellutlisting permisjoner__detaljer">
              <tbody>
                <tr>
                  <th>Fra</th>
                  <th>Til</th>
                  <th>ID</th>
                  <th>Prosent</th>
                  <th>Arbeidsgiver</th>
                  <th>Type</th>
                </tr>
                { permisjoner.map(permisjonen => <Permisjonen key={uuid()} permisjonen={permisjonen} />) }
              </tbody>
            </table>
          </Nav.Container>
        </section>
      </Nav.EkspanderbartPanel>
    </div>
  );
}

Permisjoner.propTypes = {
  permisjoner: MPT.Permisjoner.isRequired,
};

export default Permisjoner;
