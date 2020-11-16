import React from 'react';

import * as KV from '../../../../../../kodeverk';

import { StrukturertAdresse } from '../../../../../adresser';

import { RedigeringUtfort as RedigeringUtfortType } from '../types';

import './redigeringUtfort.css';

const RedigeringUtfort = ({
  verdier,
}: RedigeringUtfortType<KV.Form.ArbeidsstedUtland>) => (
  <div className="arbeidssted__utland__redigeringutfort">
    {
      verdier.map((element, index) => (
        /* eslint-disable-next-line react/no-array-index-key */
        <StrukturertAdresse key={index} adresse={element.adresse} />
      ))
    }
  </div>
);

export default RedigeringUtfort;
