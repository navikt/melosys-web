import React from 'react';

import * as KV from '../../../../../../kodeverk';

import MKV from '../../../../../../melosyskodeverk';

import { RedigeringUtfort as RedigeringUtfortType } from '../types';

const RedigeringUtfort = ({
  verdier,
}: RedigeringUtfortType<KV.Form.ArbeidsstedOffshore>) => (
  <table className="tabell">
    <thead>
      <tr>
        <th>Navn på innretning</th>
        <th>Landsokkel</th>
      </tr>
    </thead>
    <tbody>
      {
        verdier.map(element => (
          <tr>
            <td>{element.enhetNavn}</td>
            <td>{KV.kodeTilTerm(element.installasjonsLandkode, MKV.KTObjects.landkoder)}</td>
          </tr>
        ))
      }
    </tbody>
  </table>
);

export default RedigeringUtfort;
