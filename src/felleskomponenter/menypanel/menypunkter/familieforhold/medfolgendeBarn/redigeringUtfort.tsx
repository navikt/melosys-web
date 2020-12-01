import React from 'react';
import classNames from 'classnames';

import * as KV from '../../../../../kodeverk';

import { EnRedigeringsknappListeRedigeringUtfort } from '../../editerbartElementListe';
import KopierbarTekst from '../../kopierbarTekst';

import './redigeringUtfort.css';

const cls = classNames('tabell', 'medfolgende-barn__redigeringutfort');

const RedigeringUtfort = ({
  verdier,
}: EnRedigeringsknappListeRedigeringUtfort<KV.Form.MedfolgendeBarn>) => (
  <table className={cls}>
    <thead>
      <tr>
        <th>Navn</th>
        <th>F.nr./d-nr.</th>
      </tr>
    </thead>
    <tbody>
      {
        verdier.map((element, index) => (
          /* eslint-disable-next-line react/no-array-index-key */
          <tr key={index}>
            <td>{element.navn}</td>
            <td>
              {
                element.fnr &&
                <KopierbarTekst>{element.fnr.toString()}</KopierbarTekst>
              }
            </td>
          </tr>
        ))
      }
    </tbody>
  </table>
);

export default RedigeringUtfort;
