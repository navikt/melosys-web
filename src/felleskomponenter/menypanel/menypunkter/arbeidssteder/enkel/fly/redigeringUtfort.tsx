import React from 'react';

import * as KV from '../../../../../../kodeverk';

import MKV from '../../../../../../melosyskodeverk';

import { RedigeringUtfort as RedigeringUtfortType } from '../types';

const RedigeringUtfort = ({
  verdier,
}: RedigeringUtfortType<KV.Form.ArbeidsstedFly>) => (
  <table className="tabell">
    <thead>
      <tr>
        <th>Navn på hjemmebase</th>
        <th>Type flyvninger</th>
        <th>Hjemmebasens land</th>
      </tr>
    </thead>
    <tbody>
      {
        verdier.map(element => (
          <tr>
            <td>{element.hjemmebaseNavn}</td>
            <td>{KV.kodeTilTerm(element.typeFlyvninger, MKV.KTObjects.flyvningstyper)}</td>
            <td>{KV.kodeTilTerm(element.hjemmebaseLand, MKV.KTObjects.landkoder)}</td>
          </tr>
        ))
      }
    </tbody>
  </table>
);

export default RedigeringUtfort;
