import React, { Fragment } from 'react';
import * as MKV from 'melosys-kodeverk';

const uuid = require('uuid/v4');

const { Koder, KTObjects, KTValues } = MKV;

const Kodeverk = () => {
  const koder = Object.entries(Koder.aktoersroller);
  const values = Object.entries(KTValues.aktoersroller);
  return (
    <div>
      <h1>MelosysKodeverk</h1>
      <p>Koder.aktoersroller:</p>
      <ul>
        {koder.map(kode => <Fragment key={uuid()}><li>kode:{kode[0]}&nbsp;&#61;&gt;&nbsp;term:{kode[1]}</li></Fragment>)}
      </ul>
      <p>KTObjects.aktoersroller</p>
      <ul>
        {KTObjects.aktoersroller.map(item => <Fragment key={uuid()}><li>&#123;kode:{item.kode},&nbsp;term:{item.term}&#125;</li></Fragment>)}
      </ul>
      <p>KTValues.aktoersroller:</p>
      <ul>
        {values.map(val => <Fragment key={uuid()}><li>kode:{val[0]}&nbsp;&#61;&gt;&nbsp;term:{val[1]}</li></Fragment>)}
      </ul>
    </div>
  );
};
export default Kodeverk;
