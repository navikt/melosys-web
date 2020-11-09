import React from 'react';

import * as KV from '../../../../../../kodeverk';
import * as Utils from '../../../../../../utils';

import { StrukturertAdresse } from '../../../../../adresser';

import { RedigeringUtfort as RedigeringUtfortType } from '../types';

import './redigeringUtfort.css';

const RedigeringUtfort = ({
  verdier,
}: RedigeringUtfortType<KV.Form.ArbeidsstedUtland>) => (
  <div className="arbeidssted__utland__redigeringutfort">
    {
      verdier.map(element => (
        <StrukturertAdresse key={Utils._uuid()} adresse={element.adresse} />
      ))
    }
  </div>
);

export default RedigeringUtfort;
