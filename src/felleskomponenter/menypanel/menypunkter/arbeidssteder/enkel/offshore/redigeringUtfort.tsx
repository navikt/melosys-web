import React from 'react';
import classNames from 'classnames';

import * as KV from '../../../../../../kodeverk';

import MKV from '../../../../../../melosyskodeverk';

import { EnRedigeringsknappListeRedigeringUtfort } from '../../../editerbartElementListe';

import './redigeringUtfort.css';

const cls = classNames('tabell', 'arbeidssted__offshore__redigeringutfort');

const RedigeringUtfort = ({
  verdier,
}: EnRedigeringsknappListeRedigeringUtfort<KV.Form.ArbeidsstedOffshore>) => (
  <table className={cls}>
    <thead>
      <tr>
        <th>Navn på innretning</th>
        <th>Landsokkel</th>
      </tr>
    </thead>
    <tbody>
      {
        verdier.map((element, index) => (
          /* eslint-disable-next-line react/no-array-index-key */
          <tr key={index}>
            <td>{element.enhetNavn}</td>
            <td>{KV.kodeTilTerm(element.installasjonsLandkode, MKV.KTObjects.landkoder)}</td>
          </tr>
        ))
      }
    </tbody>
  </table>
);

export default RedigeringUtfort;
