import React from 'react';

import * as KV from '../../../../../../kodeverk';

import MKV from '../../../../../../melosyskodeverk';

import { RedigeringUtfort as RedigeringUtfortType } from '../types';

const RedigeringUtfort = ({
  verdier,
}: RedigeringUtfortType<KV.Form.ArbeidsstedSkip>) => (
  <table className="tabell">
    <thead>
      <tr>
        <th>Navn på skip</th>
        <th>Fartsområde</th>
        <th>Flaggstat/lands territorialfarvann</th>
      </tr>
    </thead>
    <tbody>
      {
        verdier.map(element => (
          <tr>
            <td>{element.enhetNavn}</td>
            <td>{KV.kodeTilTerm(element.fartsomradeKode, MKV.KTObjects.begrunnelser.fartsomrader)}</td>
            {
              element.flaggLandkode &&
              <td>{KV.kodeTilTerm(element.flaggLandkode, MKV.KTObjects.landkoder)}</td>
            }
            {
              element.territorialfarvann &&
              <td>{KV.kodeTilTerm(element.territorialfarvann, MKV.KTObjects.landkoder)}</td>
            }
          </tr>
        ))
      }
    </tbody>
  </table>
);

export default RedigeringUtfort;
