import React from 'react';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes';

import EnkeltDato from './datoOmrade/enkeltDato';

import './permisjoner.css';

const uuid = require('uuid/v4');

function Permisjonen({ permisjonen }) {
  const { periode, grad, inntektstype, permisjonstype, arbeidsgiver, innmeldt } = permisjonen;
  return (
    <tr>
      <td>{<EnkeltDato dato={periode.fom} />} </td>
      <td>{<EnkeltDato dato={periode.tom} />}</td>
      <td>{grad}</td>
      <td>{arbeidsgiver.navn}</td>
      <td>{inntektstype}</td>
      <td>{permisjonstype}</td>
      <td>{innmeldt}</td>
    </tr>
  );
}

function Permisjoner({ permisjoner }) {
  return (
    <div className="medlemskap panelSeksjon">
      <Nav.EkspanderbartPanel tittel="Permisjoner" apen>
        <section aria-label="permisjoner">
          <Nav.Container fluid>
            <table>
              <tbody>
                <tr>
                  <th>Fra</th>
                  <th>Til</th>
                  <th>Grad</th>
                  <th>Arbeidsgiver</th>
                  <th>Type</th>
                  <th>Permisjonstype</th>
                  <th>Innmeldt</th>
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
